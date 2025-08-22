# Admin User Management Setup Guide

This guide explains how to set up the admin user management feature in your Supabase database.

## Prerequisites

- Supabase project created
- Database access through Supabase Dashboard or SQL Editor
- At least one user account created (this will become your first admin)

## Step 1: Run the Database Setup

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `admin-setup.sql`
4. Execute the SQL queries

## Step 2: Create Your First Admin User

### Option A: Through Supabase Dashboard

1. Go to Authentication > Users in your Supabase Dashboard
2. Create a new user or use an existing one
3. Note the user's email address
4. Run this SQL query in the SQL Editor (replace with actual email):

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'your-admin@example.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

### Option B: Through the Application

1. Use the `setInitialAdmin` function from `adminService.js`:

```javascript
import { setInitialAdmin } from './src/lib/adminService'

// Run this once during setup
const setupAdmin = async () => {
  const { success, error } = await setInitialAdmin('your-admin@example.com')
  if (success) {
    console.log('Admin user created successfully')
  } else {
    console.error('Error creating admin:', error)
  }
}
```

## Step 3: Update Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 4: Test the Admin Features

1. Start your application: `npm run dev`
2. Log in with your admin account
3. Navigate to `/users` to access the User Management page
4. Verify you can:
   - View all users
   - Create new users
   - Assign roles
   - Delete users (except yourself)

## Database Schema Overview

### Tables Created

1. **`user_roles`** - Stores user role assignments
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to auth.users)
   - `role` (VARCHAR, default: 'user')
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

### Functions Created

1. **`handle_new_user()`** - Automatically assigns 'user' role to new signups
2. **`get_users_with_roles()`** - Returns all users with their roles (admin only)
3. **`update_user_role()`** - Updates a user's role (admin only)
4. **`delete_user_account()`** - Deletes a user account (admin only)

### Row Level Security (RLS)

RLS policies ensure that:
- Users can only view their own role
- Only admins can view, create, update, or delete user roles
- All admin functions require admin privileges

## Available User Roles

- **`admin`** - Full access to user management features
- **`user`** - Standard user with no admin privileges

You can extend this by adding more roles as needed.

## Security Features

1. **Row Level Security** - Database-level access control
2. **Function-level checks** - All admin functions verify admin status
3. **Self-protection** - Admins cannot delete their own accounts
4. **Automatic role assignment** - New users get 'user' role by default

## Troubleshooting

### Common Issues

1. **"Access denied" errors**
   - Verify the user has admin role in the database
   - Check that RLS policies are properly set up

2. **Functions not found**
   - Ensure all SQL queries from `admin-setup.sql` were executed
   - Check function permissions are granted

3. **User creation fails**
   - Verify Supabase service role key has admin privileges
   - Check that the auth.admin functions are available

### Verification Queries

To verify your setup, run these queries in the SQL Editor:

```sql
-- Check if user_roles table exists
SELECT * FROM public.user_roles;

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_users_with_roles', 'update_user_role', 'delete_user_account');

-- Check admin users
SELECT u.email, ur.role 
FROM auth.users u 
JOIN public.user_roles ur ON u.id = ur.user_id 
WHERE ur.role = 'admin';
```

## Next Steps

After setting up the admin features:

1. Test all functionality thoroughly
2. Create additional admin users if needed
3. Consider implementing additional roles (e.g., 'moderator', 'teacher')
4. Set up proper backup procedures for your user data

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Check the Supabase logs for database errors
3. Verify your RLS policies are correctly configured
4. Ensure your Supabase project has the necessary permissions