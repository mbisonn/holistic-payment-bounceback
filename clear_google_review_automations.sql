-- Clear out all Google review request automations except the 1 Month After Purchase one
DELETE FROM public.automation_rules 
WHERE name LIKE '%Google Review Request%' 
AND name != 'Google Review Request - 1 Month After Purchase';

-- Verify the remaining automation rules
SELECT id, name, trigger, action, is_active, created_at 
FROM public.automation_rules 
ORDER BY created_at DESC;
