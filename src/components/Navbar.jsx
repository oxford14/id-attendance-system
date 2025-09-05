import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogOut, Home, Users, Scan, FileText, Bell, Settings, Tag } from 'lucide-react'

const Navbar = () => {
  const { user, userRole, signOut } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
            ID Attendance System
          </Link>
          
          <div className="navbar-nav">
            <Link to="/dashboard" className={isActive('/dashboard') || isActive('/')}>
              <Home size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Dashboard
            </Link>
            
            <Link to="/students" className={isActive('/students')}>
              <Users size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Students
            </Link>
            
            <Link to="/rfid" className={isActive('/rfid')}>
              <Tag size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              RFID Management
            </Link>
            
            <Link to="/scanner" className={isActive('/scanner')}>
              <Scan size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Scanner
            </Link>
            
            <Link to="/attendance" className={isActive('/attendance')}>
              <FileText size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Records
            </Link>
            
            <Link to="/notifications" className={isActive('/notifications')}>
              <Bell size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Notifications
            </Link>
            
            {userRole === 'admin' && (
              <Link to="/users" className={isActive('/users')}>
                <Settings size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                User Management
              </Link>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>
                {user?.email}
              </span>
              <button 
                onClick={handleSignOut}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                <LogOut size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar