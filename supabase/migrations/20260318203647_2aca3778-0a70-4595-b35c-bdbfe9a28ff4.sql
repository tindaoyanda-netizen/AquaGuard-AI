-- Phase 1, Step 1: Add performance indexes on frequently queried fields

CREATE INDEX IF NOT EXISTS idx_environmental_reports_county_status 
ON public.environmental_reports (county_id, status);

CREATE INDEX IF NOT EXISTS idx_environmental_reports_created_at 
ON public.environmental_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_environmental_reports_reporter_id 
ON public.environmental_reports (reporter_id);

CREATE INDEX IF NOT EXISTS idx_environmental_reports_location 
ON public.environmental_reports (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
ON public.profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON public.user_roles (user_id);

CREATE INDEX IF NOT EXISTS idx_report_replies_report_id 
ON public.report_replies (report_id);

CREATE INDEX IF NOT EXISTS idx_report_verifications_report_id 
ON public.report_verifications (report_id);