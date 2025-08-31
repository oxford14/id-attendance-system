import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { supabase } = useAuth()
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')
        
        // Also check URL search params
        const urlType = searchParams.get('type')
        const urlToken = searchParams.get('token')
        
        if (type === 'signup' || urlType === 'signup') {
          // Handle email confirmation
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              throw error
            }
            
            setStatus('success')
            setMessage('Email confirmed successfully! Redirecting to dashboard...')
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          } else if (urlToken) {
            // Handle token-based confirmation
            const { error } = await supabase.auth.verifyOtp({
              token_hash: urlToken,
              type: 'signup'
            })
            
            if (error) {
              throw error
            }
            
            setStatus('success')
            setMessage('Email confirmed successfully! Redirecting to dashboard...')
            
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          } else {
            throw new Error('Invalid confirmation link')
          }
        } else {
          // Handle other auth types or redirect to login
          navigate('/login')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || 'Failed to confirm email. Please try again.')
      }
    }

    handleAuthCallback()
  }, [navigate, searchParams, supabase])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader size={48} className="animate-spin" style={{ color: '#3b82f6', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Confirming Email
            </h1>
            <p style={{ color: '#6b7280' }}>
              Please wait while we confirm your email address...
            </p>
          </>
        )
      
      case 'success':
        return (
          <>
            <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Email Confirmed!
            </h1>
            <p style={{ color: '#6b7280' }}>
              {message}
            </p>
          </>
        )
      
      case 'error':
        return (
          <>
            <XCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Confirmation Failed
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {message}
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Go to Login
            </button>
          </>
        )
      
      default:
        return null
    }
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
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default AuthCallback