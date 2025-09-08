-- Drop existing function with all possible signatures
DROP FUNCTION IF EXISTS get_public_users();
DROP FUNCTION IF EXISTS public.get_public_users();
DROP FUNCTION IF EXISTS get_public_users() CASCADE;

-- Create the get_public_users function for non-admin access
CREATE FUNCTION get_public_users()
RETURNS TABLE (
    id uuid,
    email text,
    role text,
    created_at timestamptz,
    last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        au.id,
        au.email::text,
        COALESCE(ur.role, 'student')::text as role,
        au.created_at,
        au.last_sign_in_at
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    ORDER BY au.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_public_users() TO authenticated;