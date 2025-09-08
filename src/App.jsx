import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthProvider from './contexts/AuthContext'
import StudentProvider from './contexts/StudentContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Login from './components/Login'
import ResetPassword from './components/ResetPassword'
import UpdatePassword from './components/UpdatePassword'
import AuthCallback from './components/AuthCallback'
import Dashboard from './components/Dashboard'
import StudentManagement from './components/StudentManagement'
import AttendanceScanner from './components/AttendanceScanner'
import AttendanceRecords from './components/AttendanceRecords'
import NotificationSettings from './components/NotificationSettings'
import StudentEnrollment from './components/StudentEnrollment'
import UserManagement from './components/UserManagement'
import RFIDManagement from './components/RFIDManagement'
import LoadingSpinner from './components/LoadingSpinner'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner message="Loading..." />
  }
  
  return user ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner message="Loading..." />
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children
}

// Main App Content
const AppContent = () => {
  const { user, loading } = useAuth()

  return (
    <Router>
      <div className="App">
        {user && <Navbar />}
        <main className={`container ${user ? 'main-content' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            <Route path="/update-password" element={
              <PublicRoute>
                <UpdatePassword />
              </PublicRoute>
            } />
            <Route path="/auth/callback" element={
              <PublicRoute>
                <AuthCallback />
              </PublicRoute>
            } />

            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute>
                <StudentManagement />
              </ProtectedRoute>
            } />
            <Route path="/scanner" element={
              <ProtectedRoute>
                <AttendanceScanner />
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute>
                <AttendanceRecords />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationSettings />
              </ProtectedRoute>
            } />
            <Route path="/enroll" element={
              <ProtectedRoute>
                <StudentEnrollment />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/rfid" element={
              <ProtectedRoute>
                <RFIDManagement />
              </ProtectedRoute>
            } />

            
            {/* Catch all route */}
            <Route path="*" element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

// Main App Component with ThemeProvider, AuthProvider and StudentProvider
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudentProvider>
          <AppContent />
        </StudentProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App