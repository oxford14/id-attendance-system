-- Admin User Management Setup for Supabase
-- This file contains the necessary SQL queries to set up admin functionality

-- 1. Create a custom user_roles table to manage user roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Enable Row Level Security (RLS) on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for user_roles table
-- Policy: Users can view their own role
CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Only admins can view all roles
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy: Only admins can insert new roles
CREATE POLICY "Admins can insert roles" ON public.user_roles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy: Only admins can update roles
CREATE POLICY "Admins can update roles" ON public.user_roles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- Policy: Only admins can delete roles
CREATE POLICY "Admins can delete roles" ON public.user_roles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
        )
    );

-- 4. Create a function to automatically assign default role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to automatically assign role when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create a function to get user with role information
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
    id UUID,
    email TEXT,
    role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        COALESCE(ur.role, 'user') as role,
        u.created_at,
        u.last_sign_in_at
    FROM auth.users u
    LEFT JOIN public.user_roles ur ON u.id = ur.user_id
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create a function to update user role (admin only)
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id UUID, new_role VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Update or insert role
    INSERT INTO public.user_roles (user_id, role, updated_at)
    VALUES (target_user_id, new_role, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        role = EXCLUDED.role,
        updated_at = EXCLUDED.updated_at;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create a function to delete user (admin only)
CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    -- Prevent admin from deleting themselves
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot delete your own account.';
    END IF;

    -- Delete user role first (will be handled by CASCADE)
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    
    -- Note: Deleting from auth.users requires admin privileges in Supabase
    -- This should be handled through Supabase Admin API in the application
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Insert initial admin user (replace with your admin email)
-- Note: This should be run after the first admin user is created through Supabase Auth
-- UPDATE: Replace 'admin@example.com' with your actual admin email
/*
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
*/

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_role(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO authenticated;

-- End of admin setup queries