import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  // No need for token redirection logic since users go directly to UpdatePassword from email

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email) {
      setError('Please enter your email address')
      setLoading(false)
      return
    }

    const { error } = await resetPassword(email)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
            <h1>
              Check Your Email
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Please check your email and click the link to reset your password. 
              Don't forget to check your spam folder if you don't see it in your inbox.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link 
              to="/login" 
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px', textDecoration: 'none', display: 'inline-block' }}
            >
              <ArrowLeft size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Mail size={48} style={{ color: '#3b82f6', marginBottom: '16px' }} />
          <h1>
            Reset Password
          </h1>
          <p style={{ color: '#6b7280' }}>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '20px' }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link 
            to="/login" 
            style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500', display: 'inline-flex', alignItems: 'center' }}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword