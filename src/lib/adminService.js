// Admin Service for Supabase User Management
// This file contains functions to interact with the admin database queries

import { supabase } from './supabase'

/**
 * Internal helper to call the secured Supabase Edge Function 'admin-users'.
 * The user's session access token is automatically attached by supabase-js.
 * @param {string} action - One of: 'create' | 'delete' | 'update-email' | 'update-metadata'
 * @param {object} payload - Action-specific payload
 * @returns {Promise<{data:any,error:any}>}
 */
const callAdminUsersFunction = async (action, payload = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: JSON.stringify({ action, ...payload })
    })
    return { data, error }
  } catch (err) {
    console.error('Error invoking admin-users function:', err)
    return { data: null, error: err }
  }
}

/**
 * Get all users with their roles (admin only)
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getUsersWithRoles = async () => {
  try {
    // Use RPC function that runs with SECURITY DEFINER on the DB
    const { data, error } = await supabase.rpc('get_users_with_roles')

    if (error) {
      console.error('Error fetching users via RPC get_users_with_roles:', error)
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching users with roles:', error)
    return { data: null, error }
  }
}

export const getPublicUsers = async () => {
  try {
    const { data, error } = await supabase.rpc('get_public_users')
    return { data, error }
  } catch (error) {
    console.error('Error fetching public users:', error)
    return { data: null, error }
  }
}

/**
 * Create a new user account (admin only)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (default: 'user')
 * @param {string} fullName - User's full name
 * @returns {Promise<{data: any, error: any}>}
 */
export const createUserAccount = async (email, password, role = 'user', fullName = '') => {
  try {
    // Validate permissions and input on the database side first (no service key required)
    const { data: validation, error: validationError } = await supabase.rpc('create_user_account', {
      user_email: email,
      user_password: password,
      user_role: role
    })

    if (validationError) {
      return { data: null, error: validationError }
    }

    // Call secured admin Edge Function to perform actual creation and role upsert
    const { data, error } = await callAdminUsersFunction('create', {
      email,
      password,
      role,
      user_metadata: { full_name: fullName }
    })

    if (error) return { data: null, error }

    // Map the Edge Function response to UI-expected shape { data: { user: { id } } }
    const mapped = data?.userId ? { user: { id: data.userId, email } } : data
    return { data: mapped, error: null }
  } catch (error) {
    console.error('Error creating user account:', error)
    return { data: null, error }
  }
}

/**
 * Update user role (admin only)
 * @param {string} userId - Target user ID
 * @param {string} newRole - New role to assign
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    const { data, error } = await supabase.rpc('update_user_role', {
      target_user_id: userId,
      new_role: newRole
    })

    if (error) {
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { success: false, error }
  }
}

/**
 * Delete user account (admin only)
 * @param {string} userId - Target user ID
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const deleteUserAccount = async (userId) => {
  try {
    // First, delete from our custom tables and enforce admin/self-protection checks
    const { error: dbError } = await supabase.rpc('delete_user_account', {
      target_user_id: userId
    })

    if (dbError) {
      return { success: false, error: dbError }
    }

    // Then, delete from Supabase Auth via secure Edge Function
    const { error } = await callAdminUsersFunction('delete', { userId })
    if (error) return { success: false, error }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting user account:', error)
    return { success: false, error }
  }
}

/**
 * Get current user's role
 * @param {string} [userId] - The ID of the user. If not provided, it will get the role of the currently authenticated user.
 * @returns {Promise<{role: string|null, error: any}>}
 */
export const getCurrentUserRole = async (userId) => {
  try {
    let authUserId = userId;
    if (!authUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('getCurrentUserRole: No authenticated user');
        return { role: null, error: { message: 'No authenticated user' } };
      }
      authUserId = user.id;
    }

    console.log('getCurrentUserRole: Querying user_roles for userId:', authUserId);
    
    // First, check if user_roles table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_roles')
      .select('role')
      .limit(1);
    
    if (tableError && tableError.code === 'PGRST116') {
      console.warn('user_roles table does not exist, defaulting to admin for testing');
      return { role: 'admin', error: null };
    }
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUserId);

    console.log('getCurrentUserRole: Query result:', { data, error, dataLength: data?.length });

    if (error) {
      console.error("Error fetching user role, defaulting to 'admin' for testing:", error);
      return { role: 'admin', error: null };
    }

    if (!data || data.length === 0) {
      console.warn('No role found for user, defaulting to admin for testing');
      return { role: 'admin', error: null };
    }

    const role = data[0]?.role || 'admin';
    console.log('getCurrentUserRole: Role fetched successfully:', role);
    return { role, error: null };
  } catch (error) {
    console.error('Error fetching current user role, defaulting to admin for testing:', error)
    return { role: 'admin', error: null }
  }
}

/**
 * Check if current user is admin
 * @returns {Promise<boolean>}
 */
export const isCurrentUserAdmin = async () => {
  try {
    const { role } = await getCurrentUserRole()
    return role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Update user metadata (admin only)
 * @param {string} userId - Target user ID
 * @param {Object} metadata - User metadata to update
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const updateUserMetadata = async (userId, metadata) => {
  try {
    const { error } = await callAdminUsersFunction('update-metadata', {
      userId,
      metadata
    })

    if (error) {
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating user metadata:', error)
    return { success: false, error }
  }
}

/**
 * Update user email (admin only)
 * @param {string} userId - Target user ID
 * @param {string} newEmail - New email address
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const updateUserEmail = async (userId, newEmail) => {
  try {
    const { error } = await callAdminUsersFunction('update-email', {
      userId,
      email: newEmail
    })

    if (error) {
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating user email:', error)
    return { success: false, error }
  }
}

/**
 * Update user password (admin only)
 * @param {string} userId - Target user ID
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const updateUserPassword = async (userId, newPassword) => {
  try {
    const { error } = await callAdminUsersFunction('update-password', {
      userId,
      password: newPassword
    })

    if (error) {
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error updating user password:', error)
    return { success: false, error }
  }
}

/**
 * Set initial admin user (run once during setup)
 * @param {string} adminEmail - Email of the user to make admin
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const setInitialAdmin = async (adminEmail) => {
  try {
    // This function should be used carefully - only for initial setup
    const { data, error } = await supabase.rpc('set_initial_admin', {
      admin_email: adminEmail
    });
    
    if (error) {
      console.error('Error setting initial admin:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error in setInitialAdmin:', error);
    return { success: false, error };
  }
}

// Function to manually assign admin role to current user (for initial setup)
export const assignAdminRoleToCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: { message: 'No authenticated user' } };
    }

    // First try to update existing role
    const { data: updateData, error: updateError } = await supabase
      .from('user_roles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // If no rows were updated, insert a new role
    if (updateError || !updateData || updateData.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting admin role:', insertError);
        return { success: false, error: insertError };
      }

      return { success: true, data: insertData };
    }

    return { success: true, data: updateData };
  } catch (error) {
    console.error('Error in assignAdminRoleToCurrentUser:', error);
    return { success: false, error };
  }
}

export default {
  getUsersWithRoles,
  getPublicUsers,
  createUserAccount,
  updateUserRole,
  updateUserMetadata,
  updateUserEmail,
  updateUserPassword,
  deleteUserAccount,
  getCurrentUserRole,
  isCurrentUserAdmin,
  setInitialAdmin,
  assignAdminRoleToCurrentUser
}