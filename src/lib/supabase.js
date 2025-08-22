import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
// Copy .env.example to .env and fill in your Supabase project details
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️ Supabase configuration missing! Please copy .env.example to .env and add your Supabase credentials.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // Students
  students: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    getByRfId: async (rfId) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('rf_id', rfId)
        .single()
      return { data, error }
    },

    create: async (studentData) => {
      const { data, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    },

    delete: async (id) => {
      const { data, error } = await supabase
        .from('students')
        .delete()
        .eq('id', id)
      return { data, error }
    }
  },

  // Parents
  parents: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (parentData) => {
      const { data, error } = await supabase
        .from('parents')
        .insert([parentData])
        .select()
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('parents')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    }
  },

  // Attendance
  attendance: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students (*)
        `)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getByStudentId: async (studentId) => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          students (*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    create: async (attendanceData) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert([attendanceData])
        .select(`
          *,
          students (*)
        `)
      return { data, error }
    },

    getTodayByStudentId: async (studentId) => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
      return { data, error }
    }
  }
}