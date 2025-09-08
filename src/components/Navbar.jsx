import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { LogOut, Home, Users, Scan, FileText, Bell, Settings, Tag, Menu, X, Sun, Moon } from 'lucide-react'

const Navbar = () => {
  const { user, userRole, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link'
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Top bar with hamburger menu */}
      <div className="topbar">
        <div className="topbar-content">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <Link to="/dashboard" className="topbar-brand">
            ID Attendance System
          </Link>
          <div className="topbar-user">
            <button 
              className="hamburger-btn" 
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              style={{ marginRight: '12px' }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Sidebar overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand" onClick={closeSidebar}>
            ID Attendance System
          </Link>
          <button className="sidebar-close" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-nav">
          <Link to="/dashboard" className={isActive('/dashboard') || isActive('/')} onClick={closeSidebar}>
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          
          <Link to="/students" className={isActive('/students')} onClick={closeSidebar}>
            <Users size={20} />
            <span>Students</span>
          </Link>
          
          <Link to="/rfid" className={isActive('/rfid')} onClick={closeSidebar}>
            <Tag size={20} />
            <span>RFID Management</span>
          </Link>
          
          <Link to="/scanner" className={isActive('/scanner')} onClick={closeSidebar}>
            <Scan size={20} />
            <span>Scanner</span>
          </Link>
          
          <Link to="/attendance" className={isActive('/attendance')} onClick={closeSidebar}>
            <FileText size={20} />
            <span>Records</span>
          </Link>
          
          <Link to="/notifications" className={isActive('/notifications')} onClick={closeSidebar}>
            <Bell size={20} />
            <span>Notifications</span>
          </Link>
          
          {userRole === 'admin' && (
            <Link to="/users" className={isActive('/users')} onClick={closeSidebar}>
              <Settings size={20} />
              <span>User Management</span>
            </Link>
          )}
        </div>
        
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="sidebar-logout-btn"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default Navbar