import React, { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Edit, Shield, Mail, Lock, User } from 'lucide-react'
import { getUsersWithRoles, createUserAccount, deleteUserAccount, updateUserRole } from '../lib/adminService'
import { useAuth } from '../hooks/useAuth'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
    fullName: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user, isAdmin } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await getUsersWithRoles()
      
      if (error) {
        setError('Failed to fetch users: ' + error.message)
        return
      }
      
      setUsers(data || [])
    } catch (err) {
      setError('An error occurred while fetching users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const { data, error } = await createUserAccount(
        formData.email,
        formData.password,
        formData.role,
        formData.fullName
      )

      if (error) {
        throw error
      }

      setSuccess('User created successfully!')
      setFormData({ email: '', password: '', role: 'user', fullName: '' })
      setShowCreateForm(false)
      fetchUsers() // Refresh the users list
    } catch (err) {
      console.error('Error creating user:', err)
      setError(err.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const { success, error } = await deleteUserAccount(userId)
      
      if (!success) {
        setError('Failed to delete user: ' + error.message)
        return
      }
      
      setSuccess('User deleted successfully!')
      fetchUsers()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('An error occurred while deleting user')
      console.error('Error deleting user:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin()) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <Shield size={64} style={{ color: '#ef4444', marginBottom: '20px' }} />
        <h2 style={{ color: '#ef4444', marginBottom: '10px' }}>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>You don't have permission to access user management.</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <Users size={32} style={{ color: '#3b82f6' }} />
            User Management
          </h1>
          <p style={{ color: '#6b7280' }}>Manage system users and their permissions</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          Create User
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} />
            Create New User
          </h3>
          
          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">
                  <User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Shield size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Role
                </label>
                <select
                  className="form-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false)
                  setFormData({ email: '', password: '', role: 'user', fullName: '' })
                  setError('')
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Existing Users</h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Users size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
            <p style={{ color: '#6b7280' }}>No users found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => (
                  <tr key={userData.id}>
                    <td>{userData.user_metadata?.full_name || 'N/A'}</td>
                    <td>{userData.email}</td>
                    <td>
                      <span 
                        className={`badge ${
                          userData.role === 'admin' ? 'badge-primary' : 'badge-secondary'
                        }`}
                      >
                        {userData.role || 'user'}
                      </span>
                    </td>
                    <td>{new Date(userData.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(userData.id)}
                          disabled={userData.id === user?.id} // Prevent self-deletion
                          title={userData.id === user?.id ? 'Cannot delete yourself' : 'Delete user'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

export default UserManagement