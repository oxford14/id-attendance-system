import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const StudentContext = createContext();

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('student_profile')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setStudents(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new student
  const createStudent = async (studentData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('student_profile')
        .insert([studentData])
        .select()
        .single();
      
      if (error) throw error;
      
      setStudents(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      console.error('Error creating student:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Update a student
  const updateStudent = async (id, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('student_profile')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setStudents(prev => 
        prev.map(student => 
          student.id === id ? data : student
        )
      );
      
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      console.error('Error updating student:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Delete a student
  const deleteStudent = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('student_profile')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStudents(prev => prev.filter(student => student.id !== id));
      return { error: null };
    } catch (err) {
      setError(err.message);
      console.error('Error deleting student:', err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  };

  // Get a single student by ID
  const getStudent = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('student_profile')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      console.error('Error fetching student:', err);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Search students by various criteria
  const searchStudents = async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('student_profile')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,learner_reference_number.ilike.%${searchTerm}%,email_address.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (err) {
      setError(err.message);
      console.error('Error searching students:', err);
      return { data: [], error: err };
    } finally {
      setLoading(false);
    }
  };

  // Get students by grade level
  const getStudentsByGrade = async (gradeLevel) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('student_profile')
        .select('*')
        .eq('last_grade_level_completed', gradeLevel)
        .order('last_name', { ascending: true });
      
      if (error) throw error;
      
      return { data: data || [], error: null };
    } catch (err) {
      setError(err.message);
      console.error('Error fetching students by grade:', err);
      return { data: [], error: err };
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Load students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const value = {
    students,
    loading,
    error,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudent,
    searchStudents,
    getStudentsByGrade,
    clearError
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

export default StudentProvider;