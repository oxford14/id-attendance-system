import React, { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import TailwindTest from './TailwindTest'
import { Users, UserCheck, Calendar, Clock, TrendingUp, BarChart3 } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    totalAttendance: 0,
    attendanceRate: 0,
    weeklyAttendance: []
  })
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get total students
      const { data: students, error: studentsError } = await db.students.getAll()
      if (studentsError) throw studentsError

      // Get all attendance records
      const { data: attendance, error: attendanceError } = await db.attendance.getAll()
      if (attendanceError) throw attendanceError

      // Calculate today's attendance
      const today = new Date().toISOString().split('T')[0]
      const todayAttendance = attendance?.filter(record => 
        record.created_at.startsWith(today)
      ).length || 0

      // Calculate attendance rate for today
      const attendanceRate = students?.length > 0 
        ? Math.round((todayAttendance / students.length) * 100)
        : 0

      // Calculate weekly attendance (last 7 days)
      const weeklyAttendance = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayAttendance = attendance?.filter(record => 
          record.created_at.startsWith(dateStr)
        ).length || 0
        weeklyAttendance.push({
          date: dateStr,
          count: dayAttendance,
          day: date.toLocaleDateString('en-US', { weekday: 'short' })
        })
      }

      setStats({
        totalStudents: students?.length || 0,
        todayAttendance,
        totalAttendance: attendance?.length || 0,
        attendanceRate,
        weeklyAttendance
      })

      // Get recent attendance (last 10 records)
      setRecentAttendance(attendance?.slice(0, 10) || [])
      
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          Welcome back, {user?.user_metadata?.full_name || user?.email}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>
          Here's what's happening with your attendance system today.
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
          <Users size={48} style={{ color: '#3b82f6', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {stats.totalStudents}
          </h3>
          <p style={{ color: '#6b7280' }}>Total Students</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <UserCheck size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {stats.todayAttendance}
          </h3>
          <p style={{ color: '#6b7280' }}>Today's Attendance</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <Calendar size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {stats.totalAttendance}
          </h3>
          <p style={{ color: '#6b7280' }}>Total Records</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <TrendingUp size={48} style={{ color: '#8b5cf6', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {stats.attendanceRate}%
          </h3>
          <p style={{ color: '#6b7280' }}>Today's Rate</p>
        </div>
      </div>

      {/* Weekly Attendance Chart */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          <TrendingUp size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Weekly Attendance
        </h2>
        <div className="chart-container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'end', 
          height: '200px',
          padding: '20px 0',
          borderBottom: '2px solid #e5e7eb',
          overflowX: 'auto'
        }}>
          {stats.weeklyAttendance.map((day, index) => {
            const maxCount = Math.max(...stats.weeklyAttendance.map(d => d.count), 1)
            const height = (day.count / maxCount) * 150
            const isToday = day.date === new Date().toISOString().split('T')[0]
            
            return (
              <div key={day.date} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flex: 1
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '40px',
                  height: `${height}px`,
                  backgroundColor: isToday ? '#3b82f6' : '#e5e7eb',
                  borderRadius: '4px 4px 0 0',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  color: isToday ? 'white' : '#374151',
                  fontSize: '12px',
                  fontWeight: '600',
                  paddingBottom: '4px'
                }}>
                  {day.count > 0 ? day.count : ''}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '500',
                  color: isToday ? '#3b82f6' : '#6b7280'
                }}>
                  {day.day}
                </div>
              </div>
            )
          })}
        </div>
        
        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center', 
          color: '#6b7280', 
          fontSize: '14px' 
        }}>
          Last 7 days attendance • Today highlighted in blue
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="card">
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
          <Clock size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Recent Attendance
        </h2>
        
        {recentAttendance.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <UserCheck size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No attendance records yet.</p>
            <p>Students will appear here when they scan their RF IDs.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Student</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>RF ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Time</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((record, index) => (
                  <tr key={record.id} style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                  }}>
                    <td style={{ padding: '12px' }}>
                      {record.students?.first_name} {record.students?.last_name}
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                      {record.students?.rf_id}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {formatDateTime(record.created_at)}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard