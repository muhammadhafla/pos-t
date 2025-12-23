import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  X, 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  UserX,
  UsersIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

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
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
      case 'manager':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400';
      case 'kasir':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400';
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400';
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-8">
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 w-full max-w-md shadow-xl text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
            <UserX className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">User Management</h2>
              <p className="text-muted-foreground text-lg">Manage system users and permissions</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
          >
            {showAddForm ? <X className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            {showAddForm ? 'Cancel' : 'Add New User'}
          </Button>
        </div>
      </div>

      {/* Add/Edit User Form */}
      {showAddForm && (
        <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <p className="text-muted-foreground">Fill in the user details below</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <UsersIcon className="w-4 h-4" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={editingUser}
                    placeholder="Username"
                    className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <label htmlFor="username" className="text-sm font-semibold text-foreground">Username *</label>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                  </div>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Full Name"
                    className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <label htmlFor="full_name" className="text-sm font-semibold text-foreground">Full Name *</label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <X className="w-4 h-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave empty to keep current' : 'Password'}
                    className="pl-10 h-12 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>
                <label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password {!editingUser ? '*' : '(leave empty to keep current)'}
                </label>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Shield className="w-4 h-4" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="h-12 pl-10 pr-4 bg-background/80 border-2 border-border/50 rounded-xl text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 w-full"
                  >
                    <option value="kasir">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <label htmlFor="role" className="text-sm font-semibold text-foreground">Role *</label>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200">
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline" className="border-2 border-border/50 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 px-8 py-3 rounded-xl">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 mb-8 shadow-xl">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <label htmlFor="user-search" className="text-sm font-semibold text-foreground">Search Users</label>
          </div>
          <div className="relative">
            <Input
              id="user-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username, name, or role..."
              className="pl-10 bg-background/80 border-2 border-border/50 rounded-xl focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-xl mb-8">
        {loading ? (
          <div className="p-16 text-center">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-lg font-medium">Loading users...</span>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="max-w-md mx-auto">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">No users found</h3>
              <p className="text-muted-foreground text-lg">{users.length === 0 ? 'Add your first user to get started!' : 'Try adjusting your search.'}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/80">
                <tr>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Username</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Full Name</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Last Login</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Created</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/30 hover:bg-primary/5 transition-colors duration-200">
                    <td className="p-4">
                      <span className="font-semibold text-foreground">{user.username}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-foreground">{user.full_name}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(user.is_active)}`}>
                        {user.is_active ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-muted-foreground text-sm">{user.last_login ? formatDate(user.last_login) : 'Never'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-muted-foreground text-sm">{formatDate(user.created_at)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(user)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(user.id)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          disabled={user.username === 'admin'}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Total Users</h4>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Active Users</h4>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.is_active).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Administrators</h4>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">Cashiers</h4>
                <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'kasir').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
