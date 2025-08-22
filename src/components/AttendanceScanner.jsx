import React, { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { notificationService } from '../lib/notificationService'
import { Scan, UserCheck, AlertCircle, CheckCircle, Bell } from 'lucide-react'

const AttendanceScanner = () => {
  const [rfId, setRfId] = useState('')
  const [scanning, setScanning] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success', 'error', 'info'
  const [lastScannedStudent, setLastScannedStudent] = useState(null)
  const [recentScans, setRecentScans] = useState([])

  useEffect(() => {
    loadRecentScans()
  }, [])

  const loadRecentScans = async () => {
    try {
      const { data, error } = await db.attendance.getAll()
      if (error) throw error
      
      // Get today's scans only
      const today = new Date().toISOString().split('T')[0]
      const todayScans = data?.filter(record => 
        record.created_at.startsWith(today)
      ).slice(0, 5) || []
      
      setRecentScans(todayScans)
    } catch (err) {
      console.error('Error loading recent scans:', err)
    }
  }

  const handleScan = async (e) => {
    e.preventDefault()
    if (!rfId.trim()) return

    setScanning(true)
    setMessage('')
    setMessageType('')

    try {
      // Find student by RF ID
      const { data: student, error: studentError } = await db.students.getByRfId(rfId.trim())
      
      if (studentError || !student) {
        setMessage(`No student found with RF ID: ${rfId}`)
        setMessageType('error')
        setLastScannedStudent(null)
        return
      }

      // Check if student already scanned today
      const { data: todayAttendance, error: attendanceError } = await db.attendance.getTodayByStudentId(student.id)
      
      if (attendanceError) {
        throw attendanceError
      }

      if (todayAttendance && todayAttendance.length > 0) {
        setMessage(`${student.first_name} ${student.last_name} has already been marked present today.`)
        setMessageType('info')
        setLastScannedStudent(student)
        return
      }

      // Create attendance record
      const { data: attendanceRecord, error: createError } = await db.attendance.create({
        student_id: student.id,
        status: 'present',
        scanned_at: new Date().toISOString()
      })

      if (createError) {
        throw createError
      }

      setMessage(`✅ ${student.first_name} ${student.last_name} marked present!`)
      setMessageType('success')
      setLastScannedStudent(student)
      
      // Reload recent scans
      await loadRecentScans()
      
      // TODO: Send notification to parent
      await sendParentNotification(student)
      
    } catch (err) {
      setMessage('Error processing scan. Please try again.')
      setMessageType('error')
      console.error('Scan error:', err)
    } finally {
      setScanning(false)
      setRfId('')
    }
  }

  const sendParentNotification = async (student) => {
    try {
      const result = await notificationService.sendAttendanceNotification(student)
      
      if (result.success) {
        console.log(`✅ Notification sent successfully for ${student.first_name} ${student.last_name}`)
        
        // Show notification status to user
        const notificationTypes = result.results
          .filter(r => r.success)
          .map(r => r.type)
          .join(' and ')
        
        if (notificationTypes) {
          setMessage(prev => `${prev} Parent notified via ${notificationTypes}.`)
        }
      } else {
        console.warn(`⚠️ Notification failed for ${student.first_name} ${student.last_name}:`, result.error)
      }
    } catch (error) {
      console.error('Notification error:', error)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString()
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
          RF ID Scanner
        </h1>
        <p style={{ color: '#6b7280', fontSize: '18px' }}>
          Scan student RF IDs to mark attendance
        </p>
      </div>

      {/* Scanner Interface */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Scan size={64} style={{ color: '#3b82f6', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Scan RF ID
          </h2>
          <p style={{ color: '#6b7280' }}>
            Enter or scan the student's RF ID below
          </p>
        </div>

        <form onSubmit={handleScan} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              value={rfId}
              onChange={(e) => setRfId(e.target.value)}
              placeholder="Enter RF ID (e.g., 1234567890)"
              disabled={scanning}
              autoFocus
              style={{ 
                textAlign: 'center', 
                fontSize: '18px', 
                padding: '16px',
                fontFamily: 'monospace'
              }}
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '16px', fontSize: '18px' }}
            disabled={scanning || !rfId.trim()}
          >
            {scanning ? 'Processing...' : 'Scan Attendance'}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div 
            className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}
            style={{ marginTop: '24px', textAlign: 'center' }}
          >
            {messageType === 'success' && <CheckCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
            {messageType === 'error' && <AlertCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
            {messageType === 'info' && <UserCheck size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
            {message}
          </div>
        )}

        {/* Last Scanned Student */}
        {lastScannedStudent && (
          <div style={{ 
            marginTop: '24px', 
            padding: '20px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
              {lastScannedStudent.first_name} {lastScannedStudent.last_name}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '4px' }}>Grade: {lastScannedStudent.grade}</p>
            <p style={{ color: '#6b7280', marginBottom: '4px' }}>RF ID: {lastScannedStudent.rf_id}</p>
            <p style={{ color: '#6b7280' }}>Parent: {lastScannedStudent.parent_name}</p>
          </div>
        )}
      </div>

      {/* Recent Scans Today */}
      <div className="card">
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
          Today's Scans
        </h2>
        
        {recentScans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <UserCheck size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No scans today yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {recentScans.map((scan) => (
              <div 
                key={scan.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {scan.students?.first_name} {scan.students?.last_name}
                  </h4>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Grade {scan.students?.grade} • RF ID: {scan.students?.rf_id}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    marginBottom: '4px'
                  }}>
                    Present
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    {formatTime(scan.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceScanner