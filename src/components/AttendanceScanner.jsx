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
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)

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
      const { data: student, error: studentError } = await db.studentProfiles.getByRfId(rfId.trim())
      
      if (studentError || !student) {
        setMessage(`No student found with RF ID: ${rfId}`)
        setMessageType('error')
        setLastScannedStudent(null)
        return
      }

      // Check if student already scanned today using learner_reference_number
      const { data: todayAttendance, error: attendanceError } = await db.attendance.getTodayByLearnerReferenceNumber(student.learner_reference_number)
      
      if (attendanceError) {
        throw attendanceError
      }

      if (todayAttendance && todayAttendance.length > 0) {
        setMessage(`${student.first_name} ${student.last_name} has already been marked present today.`)
        setMessageType('info')
        setLastScannedStudent(student)
        return
      }

      // Create attendance record with all required fields
      const { data: attendanceRecord, error: createError } = await db.attendance.create({
        learner_reference_number: student.learner_reference_number,
        rfid_tag: student.rfid_tag,
        school_year: student.school_year || '2024-2025',
        grade_level: student.grade || student.grade_level,
        status: 'present',
        scanned_at: new Date().toISOString(),
        notes: `Scanned via RFID at ${new Date().toLocaleString()}`
      })

      if (createError) {
        throw createError
      }

      setMessage(`✅ ${student.first_name} ${student.last_name} marked present!`)
      setMessageType('success')
      setLastScannedStudent(student)
      
      // Show success overlay
      setShowSuccessOverlay(true)
      
      // Hide overlay after 3 seconds
      setTimeout(() => {
        setShowSuccessOverlay(false)
      }, 2500)
      
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
      {/* Success Overlay */}
      {showSuccessOverlay && lastScannedStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '48px',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <CheckCircle size={64} style={{ color: '#10b981', marginBottom: '24px' }} />
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              Attendance Recorded!
            </h2>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                {lastScannedStudent.first_name} {lastScannedStudent.last_name}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '4px' }}>Grade: {lastScannedStudent.grade}</p>
              <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '4px' }}>RF ID: {lastScannedStudent.rfid_tag}</p>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>Time: {new Date().toLocaleTimeString()}</p>
            </div>
            <div style={{
              padding: '12px 24px',
              backgroundColor: '#d1fae5',
              color: '#065f46',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              ✓ Present
            </div>
          </div>
        </div>
      )}

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
            <p style={{ color: '#6b7280', marginBottom: '4px' }}>RF ID: {lastScannedStudent.rfid_tag}</p>
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
                    {scan.student_profile?.first_name} {scan.student_profile?.last_name}
                  </h4>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    Grade {scan.grade_level} • RF ID: {scan.rfid_tag}
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