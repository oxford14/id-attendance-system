import React, { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import LoadingSpinner from './LoadingSpinner'
import { FileText, Calendar, Filter, Download, Search } from 'lucide-react'

const AttendanceRecords = () => {
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    studentId: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [records, filters])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load attendance records
      const { data: attendanceData, error: attendanceError } = await db.attendance.getAll()
      if (attendanceError) throw attendanceError
      
      // Load students for filter dropdown
      const { data: studentsData, error: studentsError } = await db.students.getAll()
      if (studentsError) throw studentsError
      
      setRecords(attendanceData || [])
      setStudents(studentsData || [])
    } catch (err) {
      setError('Failed to load attendance records')
      console.error('Load records error:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...records]

    // Filter by student
    if (filters.studentId) {
      filtered = filtered.filter(record => record.student_id === filters.studentId)
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter(record => 
        new Date(record.created_at) >= new Date(filters.dateFrom)
      )
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999) // Include the entire day
      filtered = filtered.filter(record => 
        new Date(record.created_at) <= toDate
      )
    }

    // Filter by search term (student name)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(record => {
        const studentName = `${record.students?.first_name} ${record.students?.last_name}`.toLowerCase()
        return studentName.includes(searchLower) || 
               record.students?.rf_id?.toLowerCase().includes(searchLower)
      })
    }

    setFilteredRecords(filtered)
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const clearFilters = () => {
    setFilters({
      studentId: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    })
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Student Name', 'Grade', 'RF ID', 'Status']
    const csvData = filteredRecords.map(record => [
      new Date(record.created_at).toLocaleDateString(),
      new Date(record.created_at).toLocaleTimeString(),
      `${record.students?.first_name} ${record.students?.last_name}`,
      record.students?.grade,
      record.students?.rf_id,
      'Present'
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-records-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    }
  }

  const getAttendanceStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const thisWeek = new Date()
    thisWeek.setDate(thisWeek.getDate() - 7)
    
    const todayCount = filteredRecords.filter(record => 
      record.created_at.startsWith(today)
    ).length
    
    const weekCount = filteredRecords.filter(record => 
      new Date(record.created_at) >= thisWeek
    ).length
    
    return {
      total: filteredRecords.length,
      today: todayCount,
      week: weekCount
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading attendance records..." />
  }

  const stats = getAttendanceStats()

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Attendance Records
        </h1>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>
          View and manage attendance history
        </p>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.total}
          </h3>
          <p style={{ color: '#6b7280' }}>Total Records</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
            {stats.today}
          </h3>
          <p style={{ color: '#6b7280' }}>Today</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.week}
          </h3>
          <p style={{ color: '#6b7280' }}>This Week</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          <Filter size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Filters
        </h2>
        
        <div className="filter-grid">
          <div className="form-group">
            <label className="form-label">
              <Search size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Search Student
            </label>
            <input
              type="text"
              name="searchTerm"
              className="form-input"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search by name or RF ID"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Student</label>
            <select
              name="studentId"
              className="form-input"
              value={filters.studentId}
              onChange={handleFilterChange}
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} - {student.grade}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              From Date
            </label>
            <input
              type="date"
              name="dateFrom"
              className="form-input"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              To Date
            </label>
            <input
              type="date"
              name="dateTo"
              className="form-input"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        
        <div className="btn-group">
          <button
            onClick={clearFilters}
            className="btn btn-secondary"
          >
            Clear Filters
          </button>
          
          <button
            onClick={exportToCSV}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            disabled={filteredRecords.length === 0}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
          <FileText size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Records ({filteredRecords.length})
        </h2>
        
        {filteredRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No attendance records found.</p>
            {Object.values(filters).some(filter => filter) ? (
              <p>Try adjusting your filters or clearing them.</p>
            ) : (
              <p>Records will appear here when students scan their RF IDs.</p>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-responsive" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                  <th className="hide-mobile" style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Time</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Student</th>
                  <th className="hide-mobile" style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Grade</th>
                  <th className="hide-mobile" style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>RF ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => {
                  const { date, time } = formatDateTime(record.created_at)
                  return (
                    <tr key={record.id} style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                    }}>
                      <td style={{ padding: '12px' }}>
                        <div>{date}</div>
                        <div className="hide-mobile" style={{ fontSize: '12px', color: '#6b7280' }}>{time}</div>
                      </td>
                      <td className="hide-mobile" style={{ padding: '12px' }}>{time}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '600' }}>
                          {record.students?.first_name} {record.students?.last_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', display: 'block' }} className="show-mobile">
                          {record.students?.grade} • {record.students?.rf_id}
                        </div>
                      </td>
                      <td className="hide-mobile" style={{ padding: '12px' }}>{record.students?.grade}</td>
                      <td className="hide-mobile" style={{ padding: '12px', fontFamily: 'monospace' }}>
                        {record.students?.rf_id}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: '#d1fae5',
                          color: '#065f46'
                        }}>
                          Present
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceRecords