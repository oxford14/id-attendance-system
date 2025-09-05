import React, { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import LoadingSpinner from './LoadingSpinner'
import { Search, Tag, Users, AlertCircle, CheckCircle, X, Edit3, Trash2, Plus } from 'lucide-react'

const RFIDManagement = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    schoolYear: '',
    gradeLevel: ''
  })
  const [schoolYears, setSchoolYears] = useState([])
  const [gradeLevels, setGradeLevels] = useState([])
  
  // RFID Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [newRfId, setNewRfId] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadStudents()
  }, [searchTerm, filters])

  const loadInitialData = async () => {
    try {
      // Load filter options
      const [schoolYearsResult, gradeLevelsResult] = await Promise.all([
        db.studentProfiles.getDistinctSchoolYears(),
        db.studentProfiles.getDistinctGradeLevels()
      ])

      if (schoolYearsResult.data) setSchoolYears(schoolYearsResult.data)
      if (gradeLevelsResult.data) setGradeLevels(gradeLevelsResult.data)
    } catch (err) {
      console.error('Error loading initial data:', err)
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      const { data, error } = await db.studentProfiles.searchForRfidAssignment(searchTerm, filters)
      
      if (error) throw error
      
      setStudents(data || [])
      setFilteredStudents(data || [])
    } catch (err) {
      setError('Failed to load students: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilters({
      schoolYear: '',
      gradeLevel: ''
    })
  }

  const openAssignModal = (student) => {
    setSelectedStudent(student)
    setNewRfId(student.rfid_tag || '')
    setShowAssignModal(true)
  }

  const closeAssignModal = () => {
    setShowAssignModal(false)
    setSelectedStudent(null)
    setNewRfId('')
    setAssignLoading(false)
  }

  const handleAssignRfId = async (e) => {
    e.preventDefault()
    if (!selectedStudent || !newRfId.trim()) return

    try {
      setAssignLoading(true)
      setError('')
      setSuccess('')

      // Check if RFID is already assigned to another student
      if (newRfId.trim() !== selectedStudent.rfid_tag) {
        const { data: existingStudent } = await db.studentProfiles.getByRfId(newRfId.trim())
        if (existingStudent && existingStudent.id !== selectedStudent.id) {
          throw new Error(`RFID ${newRfId} is already assigned to ${existingStudent.first_name} ${existingStudent.last_name}`)
        }
      }

      const { error } = await db.studentProfiles.updateRfId(selectedStudent.id, newRfId.trim())
      if (error) throw error

      setSuccess(`RFID successfully ${selectedStudent.rfid_tag ? 'updated' : 'assigned'} for ${selectedStudent.first_name} ${selectedStudent.last_name}`)
      closeAssignModal()
      loadStudents() // Refresh the list
    } catch (err) {
      setError(err.message)
    } finally {
      setAssignLoading(false)
    }
  }

  const handleRemoveRfId = async (student) => {
    if (!confirm(`Are you sure you want to remove the RFID tag from ${student.first_name} ${student.last_name}?`)) {
      return
    }

    try {
      setError('')
      setSuccess('')
      
      const { error } = await db.studentProfiles.removeRfId(student.id)
      if (error) throw error

      setSuccess(`RFID tag removed from ${student.first_name} ${student.last_name}`)
      loadStudents() // Refresh the list
    } catch (err) {
      setError('Failed to remove RFID: ' + err.message)
    }
  }

  const getRfIdStatus = (student) => {
    if (student.rfid_tag) {
      return {
        status: 'assigned',
        color: '#10b981',
        icon: CheckCircle,
        text: 'Assigned'
      }
    } else {
      return {
        status: 'unassigned',
        color: '#f59e0b',
        icon: AlertCircle,
        text: 'Not Assigned'
      }
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading students..." />
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          RFID Management
        </h1>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>
          Assign and manage RFID tags for students
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <CheckCircle size={20} style={{ marginRight: '8px' }} />
          {success}
        </div>
      )}
      
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={20} style={{ marginRight: '8px' }} />
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          <Search size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Search Students
        </h2>
        
        <div className="filter-grid">
          <div className="form-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or LRN"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">School Year</label>
            <select
              name="schoolYear"
              className="form-input"
              value={filters.schoolYear}
              onChange={handleFilterChange}
            >
              <option value="">All School Years</option>
              {schoolYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Grade Level</label>
            <select
              name="gradeLevel"
              className="form-input"
              value={filters.gradeLevel}
              onChange={handleFilterChange}
            >
              <option value="">All Grade Levels</option>
              {gradeLevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
              style={{ width: '100%' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
            <Users size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Students ({filteredStudents.length})
          </h2>
        </div>

        {filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>No students found</p>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-responsive" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>LRN</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Student Name</th>
                  <th className="hide-mobile" style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Grade Level</th>
                  <th className="hide-mobile" style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>School Year</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>RFID Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>RFID Tag</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const rfidStatus = getRfIdStatus(student)
                  const StatusIcon = rfidStatus.icon
                  
                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>
                          {student.learner_reference_number || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {student.last_name}, {student.first_name} {student.middle_name} {student.extension_name}
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile" style={{ padding: '12px' }}>
                        {student.grade_level || 'N/A'}
                      </td>
                      <td className="hide-mobile" style={{ padding: '12px' }}>
                        {student.school_year || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <StatusIcon size={16} style={{ color: rfidStatus.color, marginRight: '6px' }} />
                          <span style={{ color: rfidStatus.color, fontWeight: '500' }}>
                            {rfidStatus.text}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {student.rfid_tag ? (
                          <span style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '14px',
                            backgroundColor: '#f3f4f6',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}>
                            {student.rfid_tag}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => openAssignModal(student)}
                            title={student.rfid_tag ? 'Update RFID' : 'Assign RFID'}
                          >
                            {student.rfid_tag ? <Edit3 size={14} /> : <Plus size={14} />}
                          </button>
                          {student.rfid_tag && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoveRfId(student)}
                              title="Remove RFID"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RFID Assignment Modal */}
      {showAssignModal && selectedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeAssignModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                <Tag size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {selectedStudent.rfid_tag ? 'Update' : 'Assign'} RFID Tag
              </h3>
              <button 
                onClick={closeAssignModal}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                <X size={20} />
              </button>
            
            <div>
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Student Information</h4>
                <p><strong>Name:</strong> {selectedStudent.first_name} {selectedStudent.middle_name} {selectedStudent.last_name} {selectedStudent.extension_name}</p>
                <p><strong>LRN:</strong> {selectedStudent.learner_reference_number || 'N/A'}</p>
                <p><strong>Grade:</strong> {selectedStudent.grade_level || 'N/A'}</p>
                <p><strong>School Year:</strong> {selectedStudent.school_year || 'N/A'}</p>
                {selectedStudent.rfid_tag && (
                  <p><strong>Current RFID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedStudent.rfid_tag}</span></p>
                )}
              </div>
              
              <form onSubmit={handleAssignRfId}>
                <div className="form-group">
                  <label className="form-label">RFID Tag</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newRfId}
                    onChange={(e) => setNewRfId(e.target.value)}
                    placeholder="Enter RFID tag (e.g., 1234567890)"
                    required
                    disabled={assignLoading}
                    style={{ fontFamily: 'monospace' }}
                  />
                  <p className="form-help">Enter the RFID tag number to assign to this student</p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeAssignModal}
                    disabled={assignLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={assignLoading || !newRfId.trim()}
                  >
                    {assignLoading ? 'Saving...' : (selectedStudent.rfid_tag ? 'Update RFID' : 'Assign RFID')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RFIDManagement