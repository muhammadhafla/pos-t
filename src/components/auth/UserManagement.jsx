import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '../../contexts/AuthContext';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'kasir'
  });

  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin()) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await invoke('get_users');
      setUsers(userList);
    } catch (error) {
      console.error('Failed to load users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'kasir'
    });
    setEditingUser(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.full_name || (!editingUser && !formData.password)) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingUser) {
        // Update user logic would go here
        alert('User update functionality would be implemented here');
      } else {
        // Add new user logic would go here
        alert('User creation functionality would be implemented here');
      }
      
      resetForm();
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      password: '', // Don't prefill password
      full_name: user.full_name,
      role: user.role
    });
    setEditingUser(user);
    setShowAddForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Delete user logic would go here
        alert('User deletion functionality would be implemented here');
        await loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'admin';
      case 'manager':
        return 'manager';
      case 'kasir':
        return 'kasir';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin()) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access user management.</p>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn btn-primary"
        >
          {showAddForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {showAddForm && (
        <div className="user-form-section">
          <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={editingUser} // Don't allow username change on edit
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="full_name">Full Name *</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  Password {!editingUser ? '*' : '(leave empty to keep current)'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingUser}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="form-select"
                >
                  <option value="kasir">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingUser ? 'Update User' : 'Add User'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="user-filters">
        <div className="search-group">
          <label htmlFor="user-search">Search Users:</label>
          <input
            type="text"
            id="user-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username, name, or role..."
            className="search-input"
          />
        </div>
      </div>

      <div className="users-table-section">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="no-users">
            <p>No users found. {users.length === 0 ? 'Add your first user!' : 'Try adjusting your search.'}</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="username">{user.username}</td>
                  <td className="full-name">{user.full_name}</td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="date">
                    {user.last_login ? formatDate(user.last_login) : 'Never'}
                  </td>
                  <td className="date">{formatDate(user.created_at)}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-danger btn-sm"
                      disabled={user.username === 'admin'} // Don't delete default admin
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="user-stats">
        <div className="stat-card">
          <h4>Total Users</h4>
          <p className="stat-value">{users.length}</p>
        </div>
        <div className="stat-card">
          <h4>Active Users</h4>
          <p className="stat-value">{users.filter(u => u.is_active).length}</p>
        </div>
        <div className="stat-card">
          <h4>Administrators</h4>
          <p className="stat-value">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="stat-card">
          <h4>Cashiers</h4>
          <p className="stat-value">{users.filter(u => u.role === 'kasir').length}</p>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;