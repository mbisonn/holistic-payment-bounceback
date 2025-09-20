-- Sign out user ebuchenna1@gmail.com
-- This script revokes all sessions and tokens for the specified user

-- Get the user ID for ebuchenna1@gmail.com
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Find the user ID
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'ebuchenna1@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Delete all refresh tokens for this user (signs them out of all devices)
        DELETE FROM auth.refresh_tokens WHERE user_id = user_uuid;
        
        -- Update the user's auth.users record to force re-authentication
        UPDATE auth.users 
        SET 
            email_confirmed_at = email_confirmed_at, -- Touch the record to trigger updates
            updated_at = now()
        WHERE id = user_uuid;
        
        RAISE NOTICE 'User ebuchenna1@gmail.com has been signed out from all devices';
    ELSE
        RAISE NOTICE 'User ebuchenna1@gmail.com not found';
    END IF;
END $$;
