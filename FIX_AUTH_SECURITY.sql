-- ==============================================
-- FIX AUTH SECURITY ISSUES
-- This script addresses the auth security warnings
-- ==============================================

-- Note: Some of these settings need to be configured in the Supabase Dashboard
-- This script provides the SQL commands that can be run, but some require dashboard configuration

-- 1. ENABLE LEAKED PASSWORD PROTECTION
-- ==============================================
-- This needs to be enabled in the Supabase Dashboard under:
-- Authentication > Settings > Password Protection
-- Enable "Check passwords against HaveIBeenPwned database"

-- 2. CREATE AUTH SECURITY FUNCTIONS
-- ==============================================

-- Create function to check password strength
CREATE OR REPLACE FUNCTION public.check_password_strength(password TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    has_upper BOOLEAN;
    has_lower BOOLEAN;
    has_number BOOLEAN;
    has_special BOOLEAN;
    length_check BOOLEAN;
    strength_score INTEGER;
BEGIN
    -- Check password criteria
    has_upper := password ~ '[A-Z]';
    has_lower := password ~ '[a-z]';
    has_number := password ~ '[0-9]';
    has_special := password ~ '[^A-Za-z0-9]';
    length_check := length(password) >= 8;
    
    -- Calculate strength score
    strength_score := 0;
    IF has_upper THEN strength_score := strength_score + 1; END IF;
    IF has_lower THEN strength_score := strength_score + 1; END IF;
    IF has_number THEN strength_score := strength_score + 1; END IF;
    IF has_special THEN strength_score := strength_score + 1; END IF;
    IF length_check THEN strength_score := strength_score + 1; END IF;
    
    -- Build result
    result := jsonb_build_object(
        'is_strong', strength_score >= 4 AND length_check,
        'score', strength_score,
        'criteria', jsonb_build_object(
            'has_upper', has_upper,
            'has_lower', has_lower,
            'has_number', has_number,
            'has_special', has_special,
            'min_length', length_check
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to validate user registration
CREATE OR REPLACE FUNCTION public.validate_user_registration(
    email TEXT,
    password TEXT,
    full_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    password_check JSONB;
    email_valid BOOLEAN;
BEGIN
    -- Validate email format
    email_valid := email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    
    -- Check password strength
    password_check := public.check_password_strength(password);
    
    -- Build validation result
    result := jsonb_build_object(
        'is_valid', email_valid AND (password_check->>'is_strong')::boolean,
        'email_valid', email_valid,
        'password_check', password_check,
        'errors', CASE 
            WHEN NOT email_valid THEN ARRAY['Invalid email format']
            WHEN NOT (password_check->>'is_strong')::boolean THEN ARRAY['Password does not meet strength requirements']
            ELSE ARRAY[]::TEXT[]
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. CREATE AUTH AUDIT LOGGING
-- ==============================================

-- Create auth_audit_log table
CREATE TABLE IF NOT EXISTS public.auth_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on auth_audit_log
ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for auth_audit_log
CREATE POLICY "Allow all access to auth_audit_log" ON public.auth_audit_log FOR ALL USING (true) WITH CHECK (true);

-- Create function to log auth events
CREATE OR REPLACE FUNCTION public.log_auth_event(
    user_id UUID,
    action TEXT,
    details JSONB DEFAULT NULL,
    ip_address INET DEFAULT NULL,
    user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.auth_audit_log (user_id, action, details, ip_address, user_agent)
    VALUES (user_id, action, details, ip_address, user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. CREATE SECURITY MONITORING FUNCTIONS
-- ==============================================

-- Create function to detect suspicious activity
CREATE OR REPLACE FUNCTION public.detect_suspicious_activity(user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    recent_failed_logins INTEGER;
    recent_successful_logins INTEGER;
    account_age_days INTEGER;
    is_suspicious BOOLEAN;
BEGIN
    -- Get recent failed logins (last 24 hours)
    SELECT COUNT(*) INTO recent_failed_logins
    FROM public.auth_audit_log
    WHERE auth_audit_log.user_id = user_id
    AND action = 'login_failed'
    AND created_at > NOW() - INTERVAL '24 hours';
    
    -- Get recent successful logins (last 24 hours)
    SELECT COUNT(*) INTO recent_successful_logins
    FROM public.auth_audit_log
    WHERE auth_audit_log.user_id = user_id
    AND action = 'login_success'
    AND created_at > NOW() - INTERVAL '24 hours';
    
    -- Get account age
    SELECT EXTRACT(DAYS FROM NOW() - created_at) INTO account_age_days
    FROM auth.users
    WHERE id = user_id;
    
    -- Determine if suspicious
    is_suspicious := (
        recent_failed_logins > 5 OR
        (recent_failed_logins > 3 AND recent_successful_logins = 0) OR
        (account_age_days < 1 AND recent_failed_logins > 2)
    );
    
    -- Build result
    result := jsonb_build_object(
        'is_suspicious', is_suspicious,
        'recent_failed_logins', recent_failed_logins,
        'recent_successful_logins', recent_successful_logins,
        'account_age_days', account_age_days,
        'risk_level', CASE 
            WHEN is_suspicious THEN 'HIGH'
            WHEN recent_failed_logins > 2 THEN 'MEDIUM'
            ELSE 'LOW'
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. CREATE INDEXES FOR AUTH TABLES
-- ==============================================

-- Create indexes for auth_audit_log
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON public.auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_action ON public.auth_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON public.auth_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_action ON public.auth_audit_log(user_id, action);

-- 6. SUCCESS MESSAGE
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '🔒 AUTH SECURITY ENHANCEMENTS APPLIED! 🔒';
    RAISE NOTICE 'Password strength validation function created';
    RAISE NOTICE 'User registration validation function created';
    RAISE NOTICE 'Auth audit logging system created';
    RAISE NOTICE 'Suspicious activity detection function created';
    RAISE NOTICE 'Security indexes created';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  MANUAL STEPS REQUIRED:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Settings';
    RAISE NOTICE '2. Enable "Check passwords against HaveIBeenPwned database"';
    RAISE NOTICE '3. Configure password requirements (min length, complexity)';
    RAISE NOTICE '4. Enable email confirmation if not already enabled';
    RAISE NOTICE '5. Consider enabling MFA for admin users';
    RAISE NOTICE '';
    RAISE NOTICE 'Your authentication system is now more secure!';
END $$;
