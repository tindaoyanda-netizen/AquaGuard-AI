
-- Fix all RESTRICTIVE policies to be PERMISSIVE

-- environmental_reports
DROP POLICY IF EXISTS "Anyone can view reports" ON public.environmental_reports;
CREATE POLICY "Anyone can view reports" ON public.environmental_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.environmental_reports;
CREATE POLICY "Authenticated users can create reports" ON public.environmental_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "County admins can update reports in their county" ON public.environmental_reports;
CREATE POLICY "County admins can update reports in their county" ON public.environmental_reports FOR UPDATE USING (has_role(auth.uid(), 'county_admin'::app_role) AND county_id = get_user_county(auth.uid())) WITH CHECK (has_role(auth.uid(), 'county_admin'::app_role) AND county_id = get_user_county(auth.uid()));

-- report_verifications
DROP POLICY IF EXISTS "Anyone can view verifications" ON public.report_verifications;
CREATE POLICY "Anyone can view verifications" ON public.report_verifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "County admins can create verifications for their county" ON public.report_verifications;
CREATE POLICY "County admins can create verifications for their county" ON public.report_verifications FOR INSERT WITH CHECK (has_role(auth.uid(), 'county_admin'::app_role) AND EXISTS (SELECT 1 FROM environmental_reports WHERE environmental_reports.id = report_verifications.report_id AND environmental_reports.county_id = get_user_county(auth.uid())));

-- report_replies
DROP POLICY IF EXISTS "Anyone can view replies" ON public.report_replies;
CREATE POLICY "Anyone can view replies" ON public.report_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "County admins can reply to reports in their county" ON public.report_replies;
CREATE POLICY "County admins can reply to reports in their county" ON public.report_replies FOR INSERT WITH CHECK (has_role(auth.uid(), 'county_admin'::app_role) AND auth.uid() = admin_id AND EXISTS (SELECT 1 FROM environmental_reports WHERE environmental_reports.id = report_replies.report_id AND environmental_reports.county_id = get_user_county(auth.uid())));

-- user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;
CREATE POLICY "Users can insert their own role during signup" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
