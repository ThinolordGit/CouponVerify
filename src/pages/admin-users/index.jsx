/**
 * src/pages/admin-users/index.jsx
 * Admin Users Management
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Lock, Unlock } from 'lucide-react';
import AdminSidebar from '../../components/ui/AdminSidebar';
import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import userService from '../../services/userService';
import { useTranslation } from '../../context/I18nContext';

const AdminUsersManagement = () => {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password_hash: '',
    username: '',
    role: 'admin'
  });
  const [actionConfirm, setActionConfirm] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({});
      setUsers(response.data?.users || []);
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formDt = formData;
    if ( !formData.email.trim()) {
      setError(t('adminUsers.errorEmail'));
      return;
    }
    if ( !formData.role.trim()) {
      setError(t('adminUsers.errorRole'));
      return;
    }
    if (!formData.username.trim() && formData.email?.trim()) {
      formDt = { ...formData, username: formData.email?.trim() };
      setFormData(formDt)
    }
    if (!editingUser && !formData.password_hash.trim() ) {
      setError(t('adminUsers.errorPassword'));
    }
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
        setSuccess(t('adminUsers.updateUserSuccess'));
      } else {
        await userService.createUser(formData);
        setSuccess(t('adminUsers.addUserSuccess'));
      }

      setTimeout(() => setSuccess(null), 3000);
      setFormData({
        full_name: '',
        email: '',
        password_hash: '',
        username: '',
        role: 'admin'
      });
      setShowModal(false);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      role: user.role
    });
    setEditingUser(user);
    setShowModal(true);
  };
  
  const handleDeleteUser = async (user) => {
    try {
      await userService.deleteUser(user.id);
      setSuccess(t('adminUsers.deleteUserSuccess'));
      setTimeout(() => setSuccess(null), 3000);
      setActionConfirm(null);
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Users', path: '/admin-dashboard/users' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onCollapsing={setSidebarCollapsed}
      />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]'}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <BreadcrumbNavigation items={breadcrumbs} />
          <div className="flex items-center justify-between mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{t('adminUsers.title')}</h1>
            <button
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  full_name: '',
                  email: '',
                  password_hash: '',
                  username: '',
                  role: 'admin'
                });
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus size={20} />
              {t('adminUsers.addUser')}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="px-6 pt-6 space-y-2">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Filters & Search */}
          <div className="mb-6 flex gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('adminUsers.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminUsers.all')} ({users.length})
              </button>
              <button
                onClick={() => setFilter('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminUsers.filterAdmin')}
              </button>
              <button
                onClick={() => setFilter('super_admin')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'blocked'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('adminUsers.filterSuperAdmin')}
              </button>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-12">{t('adminUsers.loading')}</div>
          ) : filteredUsers.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminUsers.columnName')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminUsers.columnUsername')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminUsers.columnEmail')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminUsers.columnRole')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('adminUsers.columnJoined')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{user.full_name}</td>
                      <td className="px-6 py-4 text-gray-600">{user.username}</td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === 'admin'
                            ? 'bg-green-100 text-green-800'
                            : user.role === 'manager'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.role === 'admin' ? t('adminUsers.roleAdmin') : (user.role === 'manager' ? t('adminUsers.roleManager') : t('adminUsers.roleSuperAdmin'))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => setActionConfirm({ type: 'delete', user })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-500 text-lg">{t('adminUsers.noUsers')}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* User Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingUser ? t('adminUsers.editUser') : t('adminUsers.addNewUser')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.formFullName')}</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.formUsername')}</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {!editingUser && <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.formPassword')}</label>
                <input
                  type="password"
                  value={formData.password_hash}
                  onChange={(e) => setFormData({ ...formData, password_hash: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.formEmail')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('adminUsers.formRole')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">{t('adminUsers.roleAdmin')}</option>
                  <option value="manager">{t('adminUsers.roleManager')}</option>
                  <option value="super_admin">{t('adminUsers.roleSuperAdmin')}</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  {t('adminUsers.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingUser ? t('adminUsers.update') : t('adminUsers.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {actionConfirm.type === 'block' && t('adminUsers.confirmBlock')}
              {actionConfirm.type === 'unblock' && t('adminUsers.confirmUnblock')}
              {actionConfirm.type === 'delete' && t('adminUsers.confirmDelete')}
            </h3>
            <p className="text-gray-600 mb-6">
              {actionConfirm.type === 'block' && t('adminUsers.confirmBlockMsg').replace('{name}', actionConfirm.user.full_name)}
              {actionConfirm.type === 'unblock' && t('adminUsers.confirmUnblockMsg').replace('{name}', actionConfirm.user.full_name)}
              {actionConfirm.type === 'delete' && t('adminUsers.confirmDeleteMsg').replace('{name}', actionConfirm.user.full_name)}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setActionConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                {t('adminUsers.cancel')}
              </button>
              <button
                onClick={() => {
                  if (actionConfirm.type === 'block') handleBlockUser(actionConfirm.user);
                  else if (actionConfirm.type === 'unblock') handleUnblockUser(actionConfirm.user);
                  else if (actionConfirm.type === 'delete') handleDeleteUser(actionConfirm.user);
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${
                  actionConfirm.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionConfirm.type === 'block' && t('adminUsers.buttonBlock')}
                {actionConfirm.type === 'unblock' && t('adminUsers.buttonUnblock')}
                {actionConfirm.type === 'delete' && t('adminUsers.buttonDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManagement;
