
DROP POLICY IF EXISTS "Users can insert their own role during signup" ON public.user_roles;
CREATE POLICY "Users can only self-assign resident role" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'resident');
