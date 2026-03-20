
-- Create admin_invitations table
CREATE TABLE public.admin_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  county_id text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'sub_admin',
  invited_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(email, county_id)
);

ALTER TABLE public.admin_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "County admins can view their county invitations"
  ON public.admin_invitations FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'county_admin') AND county_id = get_user_county(auth.uid()));

CREATE POLICY "County admins can invite sub-admins"
  ON public.admin_invitations FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'county_admin')
    AND county_id = get_user_county(auth.uid())
    AND auth.uid() = invited_by
    AND role = 'sub_admin'
  );

CREATE POLICY "County admins can update invitations"
  ON public.admin_invitations FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'county_admin') AND county_id = get_user_county(auth.uid()));

-- Create sub_admin_permissions table
CREATE TABLE public.sub_admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  county_id text NOT NULL,
  can_verify_reports boolean NOT NULL DEFAULT true,
  can_reply_reports boolean NOT NULL DEFAULT true,
  can_view_analytics boolean NOT NULL DEFAULT true,
  can_manage_alerts boolean NOT NULL DEFAULT false,
  can_export_data boolean NOT NULL DEFAULT false,
  granted_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, county_id)
);

ALTER TABLE public.sub_admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "County admins can view permissions"
  ON public.sub_admin_permissions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'county_admin') AND county_id = get_user_county(auth.uid()));

CREATE POLICY "Sub-admins can view own permissions"
  ON public.sub_admin_permissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "County admins can manage permissions"
  ON public.sub_admin_permissions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'county_admin') AND county_id = get_user_county(auth.uid()));

CREATE POLICY "County admins can update permissions"
  ON public.sub_admin_permissions FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'county_admin') AND county_id = get_user_county(auth.uid()));

-- Update user_roles RLS to allow sub_admin via invitation
DROP POLICY IF EXISTS "Users can only self-assign resident role" ON public.user_roles;
CREATE POLICY "Users can self-assign resident or accept sub_admin invite"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      role = 'resident'
      OR (
        role = 'sub_admin'
        AND EXISTS (
          SELECT 1 FROM public.admin_invitations
          WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND status = 'pending'
        )
      )
    )
  );

-- Update report_replies RLS
DROP POLICY IF EXISTS "County admins can reply to reports in their county" ON public.report_replies;
CREATE POLICY "Admins can reply to reports in their county"
  ON public.report_replies FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = admin_id
    AND EXISTS (
      SELECT 1 FROM environmental_reports
      WHERE environmental_reports.id = report_replies.report_id
        AND environmental_reports.county_id = get_user_county(auth.uid())
    )
    AND (
      has_role(auth.uid(), 'county_admin')
      OR (
        has_role(auth.uid(), 'sub_admin')
        AND EXISTS (
          SELECT 1 FROM sub_admin_permissions
          WHERE user_id = auth.uid() AND can_reply_reports = true
        )
      )
    )
  );

-- Update report_verifications RLS
DROP POLICY IF EXISTS "County admins can create verifications for their county" ON public.report_verifications;
CREATE POLICY "Admins can create verifications for their county"
  ON public.report_verifications FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM environmental_reports
      WHERE environmental_reports.id = report_verifications.report_id
        AND environmental_reports.county_id = get_user_county(auth.uid())
    )
    AND (
      has_role(auth.uid(), 'county_admin')
      OR (
        has_role(auth.uid(), 'sub_admin')
        AND EXISTS (
          SELECT 1 FROM sub_admin_permissions
          WHERE user_id = auth.uid() AND can_verify_reports = true
        )
      )
    )
  );

-- Update environmental_reports UPDATE policy
DROP POLICY IF EXISTS "County admins can update reports in their county" ON public.environmental_reports;
CREATE POLICY "Admins can update reports in their county"
  ON public.environmental_reports FOR UPDATE TO authenticated
  USING (
    county_id = get_user_county(auth.uid())
    AND (has_role(auth.uid(), 'county_admin') OR has_role(auth.uid(), 'sub_admin'))
  )
  WITH CHECK (
    county_id = get_user_county(auth.uid())
    AND (has_role(auth.uid(), 'county_admin') OR has_role(auth.uid(), 'sub_admin'))
  );

-- County admins can view profiles in their county
CREATE POLICY "County admins can view county profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'county_admin')
    AND county_id = get_user_county(auth.uid())
  );

-- County admins can view roles of users in their county
CREATE POLICY "County admins can view county user roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'county_admin')
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = user_roles.user_id
        AND profiles.county_id = get_user_county(auth.uid())
    )
  );

-- Add indexes
CREATE INDEX idx_admin_invitations_county ON public.admin_invitations(county_id);
CREATE INDEX idx_admin_invitations_email ON public.admin_invitations(email);
CREATE INDEX idx_sub_admin_permissions_user ON public.sub_admin_permissions(user_id);
CREATE INDEX idx_sub_admin_permissions_county ON public.sub_admin_permissions(county_id);
