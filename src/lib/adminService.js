// Admin Service for Supabase User Management
// This file contains functions to interact with the admin database queries

import { supabase } from './supabase'

/**
 * Get all users with their roles (admin only)
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getUsersWithRoles = async () => {
  try {
    const { data, error } = await supabase.rpc('get_users_with_roles')
    return { data, error }
  } catch (error) {
    console.error('Error fetching users with roles:', error)
    return { data: null, error }
  }
}

/**
 * Create a new user account (admin only)
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (default: 'user')
 * @returns {Promise<{data: any, error: any}>}
 */
export const createUserAccount = async (email, password, role = 'user') => {
  try {
    // First, create the user through Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm email for admin-created users
    })

    if (authError) {
      return { data: null, error: authError }
    }

    // Then, set the user role if it's not the default
    if (role !== 'user') {
      const { error: roleError } = await supabase.rpc('update_user_role', {
        target_user_id: authData.user.id,
        new_role: role
      })

      if (roleError) {
        console.error('Error setting user role:', roleError)
        // User was created but role assignment failed
        return { 
          data: authData.user, 
          error: { message: 'User created but role assignment failed: ' + roleError.message }
        }
      }
    }

    return { data: authData.user, error: null }
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
    // First, delete from our custom tables
    const { error: dbError } = await supabase.rpc('delete_user_account', {
      target_user_id: userId
    })

    if (dbError) {
      return { success: false, error: dbError }
    }

    // Then, delete from Supabase Auth (requires admin privileges)
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting user from auth:', authError)
      return { 
        success: false, 
        error: { message: 'User data deleted but auth deletion failed: ' + authError.message }
      }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting user account:', error)
    return { success: false, error }
  }
}

/**
 * Get current user's role
 * @returns {Promise<{role: string|null, error: any}>}
 */
export const getCurrentUserRole = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { role: null, error: { message: 'No authenticated user' } }
    }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // If no role found, default to 'user'
      if (error.code === 'PGRST116') {
        return { role: 'user', error: null }
      }
      return { role: null, error }
    }

    return { role: data.role, error: null }
  } catch (error) {
    console.error('Error getting current user role:', error)
    return { role: null, error }
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
 * Set initial admin user (run once during setup)
 * @param {string} adminEmail - Email of the user to make admin
 * @returns {Promise<{success: boolean, error: any}>}
 */
export const setInitialAdmin = async (adminEmail) => {
  try {
    // Get user by email
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()
    
    if (fetchError) {
      return { success: false, error: fetchError }
    }

    const adminUser = users.users.find(user => user.email === adminEmail)
    
    if (!adminUser) {
      return { success: false, error: { message: 'User not found with email: ' + adminEmail } }
    }

    // Set admin role
    const { success, error } = await updateUserRole(adminUser.id, 'admin')
    
    return { success, error }
  } catch (error) {
    console.error('Error setting initial admin:', error)
    return { success: false, error }
  }
}

export default {
  getUsersWithRoles,
  createUserAccount,
  updateUserRole,
  deleteUserAccount,
  getCurrentUserRole,
  isCurrentUserAdmin,
  setInitialAdmin
}