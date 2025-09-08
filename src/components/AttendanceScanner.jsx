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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl text-center max-w-sm w-11/12 shadow-2xl">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Attendance Recorded!
            </h2>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                {lastScannedStudent.first_name} {lastScannedStudent.last_name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">Grade: {lastScannedStudent.grade}</p>
              <p className="text-gray-600 dark:text-gray-400 mb-1">RF ID: {lastScannedStudent.rfid_tag}</p>
              <p className="text-gray-600 dark:text-gray-400">Time: {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="py-3 px-6 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-lg font-semibold">
              ✓ Present
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          RF ID Scanner
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Scan student RF IDs to mark attendance
        </p>
      </div>

      {/* Scanner Interface */}
      <div className="card mb-8">
        <div className="text-center mb-6">
          <Scan size={64} className="text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            Scan RF ID
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Enter or scan the student's RF ID below
          </p>
        </div>

        <form onSubmit={handleScan} className="max-w-sm mx-auto">
          <div className="form-group">
            <input
              type="text"
              className="form-input text-center text-lg p-4 font-mono"
              value={rfId}
              onChange={(e) => setRfId(e.target.value)}
              placeholder="Enter RF ID (e.g., 1234567890)"
              disabled={scanning}
              autoFocus
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full p-4 text-lg"
            disabled={scanning || !rfId.trim()}
          >
            {scanning ? 'Processing...' : 'Scan Attendance'}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'} mt-6 text-center`}>
            {messageType === 'success' && <CheckCircle size={20} className="inline mr-2 align-middle" />}
            {messageType === 'error' && <AlertCircle size={20} className="inline mr-2 align-middle" />}
            {messageType === 'info' && <UserCheck size={20} className="inline mr-2 align-middle" />}
            {message}
          </div>
        )}

        {/* Last Scanned Student */}
        {lastScannedStudent && (
          <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              {lastScannedStudent.first_name} {lastScannedStudent.last_name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-1">Grade: {lastScannedStudent.grade}</p>
            <p className="text-gray-600 dark:text-gray-400 mb-1">RF ID: {lastScannedStudent.rfid_tag}</p>
            <p className="text-gray-600 dark:text-gray-400">Parent: {lastScannedStudent.parent_name}</p>
          </div>
        )}
      </div>

      {/* Recent Scans Today */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Today's Scans
        </h2>
        
        {recentScans.length === 0 ? (
          <div className='card text-center py-10 text-gray-600 dark:text-gray-400'>
            <UserCheck size={48} className="mx-auto mb-4 opacity-50" />
            <p>No scans today yet.</p>
          </div>
        ) : (
          <div className="grid gap-3" style={{ backgroundColor: 'var(--color-background)' }}>
            {recentScans.map((scan) => (
              <div 
                key={scan.id} 
                className="flex justify-between items-center p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-card)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div>
                  <h4 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">
                    {scan.student_profile?.first_name} {scan.student_profile?.last_name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Grade {scan.grade_level} • RF ID: {scan.rfid_tag}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 mb-1">
                    Present
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
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