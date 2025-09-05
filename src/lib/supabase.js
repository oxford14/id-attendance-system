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
        .from('student_profile')
        .select('*')
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('student_profile')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    getByRfId: async (rfId) => {
      const { data, error } = await supabase
        .from('student_profile')
        .select('*')
        .eq('rfid_tag', rfId)
        .single()
      return { data, error }
    },

    create: async (studentData) => {
      const { data, error } = await supabase
        .from('student_profile')
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

  // Student Profiles
  studentProfiles: {
    getAll: async (filters = {}, pagination = {}) => {
      let query = supabase
        .from('student_profile')
        .select('id, learner_reference_number, last_name, first_name, middle_name, extension_name, sex, school_year, grade_level', { count: 'exact' })
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
      
      // Apply filters
      if (filters.schoolYear) {
        query = query.eq('school_year', filters.schoolYear)
      }
      if (filters.gradeLevel) {
        query = query.eq('grade_level', filters.gradeLevel)
      }
      
      // Apply pagination
      if (pagination.page && pagination.pageSize) {
        const from = (pagination.page - 1) * pagination.pageSize
        const to = from + pagination.pageSize - 1
        query = query.range(from, to)
      }
      
      const { data, error, count } = await query
      return { data, error, count }
    },

    getDistinctSchoolYears: async () => {
      const { data, error } = await supabase
        .from('student_profile')
        .select('school_year')
        .not('school_year', 'is', null)
        .order('school_year', { ascending: false })
      
      if (error) return { data: [], error }
      
      // Get unique school years
      const uniqueYears = [...new Set(data.map(item => item.school_year))]
      return { data: uniqueYears, error: null }
    },

    getDistinctGradeLevels: async () => {
      const { data, error } = await supabase
        .from('student_profile')
        .select('grade_level')
        .not('grade_level', 'is', null)
        .order('grade_level', { ascending: true })
      
      if (error) return { data: [], error }
      
      // Get unique grade levels
      const uniqueGrades = [...new Set(data.map(item => item.grade_level))]
      return { data: uniqueGrades, error: null }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('student_profile')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    getByRfId: async (rfId) => {
      const { data, error } = await supabase
        .from('student_profile')
        .select('*')
        .eq('rfid_tag', rfId)
        .single()
      return { data, error }
    },

    searchForRfidAssignment: async (searchTerm = '', filters = {}) => {
      let query = supabase
        .from('student_profile')
        .select('id, learner_reference_number, last_name, first_name, middle_name, extension_name, school_year, grade_level, rfid_tag')
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
      
      // Apply search filter
      if (searchTerm) {
        query = query.or(`last_name.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,learner_reference_number.ilike.%${searchTerm}%`)
      }
      
      // Apply additional filters
      if (filters.schoolYear) {
        query = query.eq('school_year', filters.schoolYear)
      }
      if (filters.gradeLevel) {
        query = query.eq('grade_level', filters.gradeLevel)
      }
      
      const { data, error } = await query
      return { data, error }
    },

    updateRfId: async (id, rfId) => {
      const { data, error } = await supabase
        .from('student_profile')
        .update({ rfid_tag: rfId })
        .eq('id', id)
        .select()
      return { data, error }
    },

    removeRfId: async (id) => {
      const { data, error } = await supabase
        .from('student_profile')
        .update({ rfid_tag: null })
        .eq('id', id)
        .select()
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
          student_profile (*)
        `)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getByStudentId: async (learnerReferenceNumber) => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          student_profile (*)
        `)
        .eq('learner_reference_number', learnerReferenceNumber)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    create: async (attendanceData) => {
      const { data, error } = await supabase
        .from('attendance')
        .insert([attendanceData])
        .select(`
          *,
          student_profile (*)
        `)
      return { data, error }
    },

    getTodayByLearnerReferenceNumber: async (learnerReferenceNumber) => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('learner_reference_number', learnerReferenceNumber)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
      return { data, error }
    },

    // Get attendance statistics
    getStats: async () => {
      const { data: todayCount, error: todayError } = await supabase
        .rpc('get_today_attendance_count')
      
      const { data: rate, error: rateError } = await supabase
        .rpc('get_attendance_rate')
      
      const { data: weeklyData, error: weeklyError } = await supabase
        .rpc('get_weekly_attendance_summary')
      
      return {
        todayCount: todayCount || 0,
        attendanceRate: rate || 0,
        weeklyData: weeklyData || [],
        errors: {
          todayError,
          rateError,
          weeklyError
        }
      }
    },

    // Check if student has attendance today
    hasAttendanceToday: async (learnerReferenceNumber) => {
      const { data, error } = await supabase
        .rpc('has_attendance_today', { learner_reference_number: learnerReferenceNumber })
      return { data, error }
    }
  }
}