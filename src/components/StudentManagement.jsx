import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/supabase'
import LoadingSpinner from './LoadingSpinner'
import StudentEnrollment from './StudentEnrollment'
import { Users, Plus, Edit, Trash2, Save, X, User } from 'lucide-react'

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    grade: '',
    rf_id: '',
    parent_name: '',
    parent_email: '',
    parent_phone: ''
  })

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.students.getAll()
      if (error) throw error
      setStudents(data || [])
    } catch (err) {
      setError('Failed to load students')
      console.error('Load students error:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      grade: '',
      rf_id: '',
      parent_name: '',
      parent_email: '',
      parent_phone: ''
    })
    setShowAddForm(false)
    setEditingStudent(null)
    setError('')
    setSuccess('')
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.last_name.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.grade.trim()) {
      setError('Grade is required')
      return false
    }
    if (!formData.rf_id.trim()) {
      setError('RF ID is required')
      return false
    }
    if (!formData.parent_name.trim()) {
      setError('Parent name is required')
      return false
    }
    if (!formData.parent_email.trim()) {
      setError('Parent email is required')
      return false
    }
    
    // Check if RF ID already exists (for new students or different student)
    const existingStudent = students.find(s => 
      s.rf_id === formData.rf_id.trim() && 
      (!editingStudent || s.id !== editingStudent.id)
    )
    if (existingStudent) {
      setError('RF ID already exists for another student')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!validateForm()) return

    try {
      if (editingStudent) {
        // Update existing student
        const { data, error } = await db.students.update(editingStudent.id, formData)
        if (error) throw error
        setSuccess('Student updated successfully!')
      } else {
        // Create new student
        const { data, error } = await db.students.create(formData)
        if (error) throw error
        setSuccess('Student added successfully!')
      }
      
      await loadStudents()
      resetForm()
    } catch (err) {
      setError('Failed to save student. Please try again.')
      console.error('Save student error:', err)
    }
  }

  const handleEdit = (student) => {
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      grade: student.grade,
      rf_id: student.rf_id,
      parent_name: student.parent_name,
      parent_email: student.parent_email,
      parent_phone: student.parent_phone || ''
    })
    setEditingStudent(student)
    setShowAddForm(true)
  }

  const handleDelete = async (student) => {
    if (!window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) {
      return
    }

    try {
      const { error } = await db.students.delete(student.id)
      if (error) throw error
      
      setSuccess('Student deleted successfully!')
      await loadStudents()
    } catch (err) {
      setError('Failed to delete student. Please try again.')
      console.error('Delete student error:', err)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading students..." />
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            Student Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '18px' }}>
            Manage student profiles and RF IDs
          </p>
        </div>
        
        <button
          onClick={() => navigate('/enroll')}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          {success}
        </div>
      )}

      {/* Student Enrollment Form */}
      {showEnrollmentForm && (
        <StudentEnrollment
          onCancel={() => {
            setShowEnrollmentForm(false)
            setError('')
            setSuccess('')
          }}
          onSuccess={() => {
            setShowEnrollmentForm(false)
            setSuccess('Student enrolled successfully!')
            loadStudents()
          }}
        />
      )}

      {/* Quick Add/Edit Form */}
      {showAddForm && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
            {editingStudent ? 'Edit Student' : 'Add New Student'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Grade</label>
                <input
                  type="text"
                  name="grade"
                  className="form-input"
                  value={formData.grade}
                  onChange={handleInputChange}
                  placeholder="Enter grade (e.g., 5A, 10B)"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">RF ID</label>
                <input
                  type="text"
                  name="rf_id"
                  className="form-input"
                  value={formData.rf_id}
                  onChange={handleInputChange}
                  placeholder="Enter RF ID"
                  style={{ fontFamily: 'monospace' }}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Parent Name</label>
                <input
                  type="text"
                  name="parent_name"
                  className="form-input"
                  value={formData.parent_name}
                  onChange={handleInputChange}
                  placeholder="Enter parent name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Parent Email</label>
                <input
                  type="email"
                  name="parent_email"
                  className="form-input"
                  value={formData.parent_email}
                  onChange={handleInputChange}
                  placeholder="Enter parent email"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Parent Phone (Optional)</label>
                <input
                  type="tel"
                  name="parent_phone"
                  className="form-input"
                  value={formData.parent_phone}
                  onChange={handleInputChange}
                  placeholder="Enter parent phone"
                />
              </div>
            </div>
            
            <div className="btn-group" style={{ marginBottom: '24px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={16} />
                {editingStudent ? 'Update Student' : 'Add Student'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students List */}
      <div className="card">
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
          <Users size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Students ({students.length})
        </h2>
        
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <User size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No students added yet.</p>
            <p>Click "Add Student" to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-responsive" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Grade</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>RF ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Parent</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Contact</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                  }}>
                    <td style={{ padding: '12px' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          {student.first_name} {student.last_name}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>{student.grade}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>{student.rf_id}</td>
                    <td style={{ padding: '12px' }}>{student.parent_name}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '14px' }}>
                        <div>{student.parent_email}</div>
                        {student.parent_phone && (
                          <div style={{ color: '#6b7280' }}>{student.parent_phone}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEdit(student)}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '14px' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '14px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentManagement