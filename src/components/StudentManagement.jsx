import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/supabase'
import LoadingSpinner from './LoadingSpinner'
import StudentEnrollment from './StudentEnrollment'
import { Users, Plus, Filter, ChevronLeft, ChevronRight, User } from 'lucide-react'

const StudentManagement = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    schoolYear: '',
    gradeLevel: ''
  })
  const [schoolYears, setSchoolYears] = useState([])
  const [gradeLevels, setGradeLevels] = useState([])
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    loadFilterOptions()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [filters, currentPage, pageSize])

  const loadFilterOptions = async () => {
    try {
      // Load school years
      const { data: years, error: yearsError } = await db.studentProfiles.getDistinctSchoolYears()
      if (yearsError) throw yearsError
      setSchoolYears(years || [])
      
      // Load grade levels
      const { data: grades, error: gradesError } = await db.studentProfiles.getDistinctGradeLevels()
      if (gradesError) throw gradesError
      setGradeLevels(grades || [])
    } catch (err) {
      console.error('Failed to load filter options:', err)
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      const { data, error, count } = await db.studentProfiles.getAll(
        filters,
        { page: currentPage, pageSize }
      )
      if (error) throw error
      
      setStudents(data || [])
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / pageSize))
    } catch (err) {
      setError('Failed to load students')
      console.error('Load students error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(parseInt(newPageSize))
    setCurrentPage(1) // Reset to first page when page size changes
  }

  const clearFilters = () => {
    setFilters({
      schoolYear: '',
      gradeLevel: ''
    })
    setCurrentPage(1)
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  if (loading && students.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
          <Users size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
          Student Management
        </h1>
        <button
          onClick={() => setShowEnrollmentForm(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={20} />
          Enroll Student
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

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={20} />
            <span style={{ fontWeight: '600' }}>Filters:</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>School Year:</label>
            <select
              value={filters.schoolYear}
              onChange={(e) => handleFilterChange('schoolYear', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '120px'
              }}
            >
              <option value="">All Years</option>
              {schoolYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Grade Level:</label>
            <select
              value={filters.gradeLevel}
              onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '120px'
              }}
            >
              <option value="">All Grades</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          
          {(filters.schoolYear || filters.gradeLevel) && (
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Students ({totalCount})
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Show:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span style={{ fontSize: '14px' }}>per page</span>
          </div>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <LoadingSpinner />
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <User size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No students found.</p>
            {(filters.schoolYear || filters.gradeLevel) ? (
              <p>Try adjusting your filters or <button onClick={clearFilters} style={{ color: '#3b82f6', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>clear all filters</button>.</p>
            ) : (
              <p>Click "Enroll Student" to get started.</p>
            )}
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table-responsive" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>LRN No.</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Last Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>First Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Middle Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Extension Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Sex</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id} style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                    }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                        {student.learner_reference_number || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>
                        {student.last_name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {student.first_name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {student.middle_name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {student.extension_name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {student.sex || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: '24px',
                padding: '16px 0',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                      color: currentPage === 1 ? '#9ca3af' : '#374151',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: pageNum === currentPage ? '#3b82f6' : 'white',
                        color: pageNum === currentPage ? 'white' : '#374151',
                        cursor: 'pointer',
                        minWidth: '40px'
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                      color: currentPage === totalPages ? '#9ca3af' : '#374151',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default StudentManagement