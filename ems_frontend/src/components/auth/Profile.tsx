import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Calendar, Save, Lock, Key } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const success = await updateProfile(profileData);
      if (success) {
        setMessage('Profile updated successfully!');
        setEditMode(false);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const success = await changePassword(passwordData.oldPassword, passwordData.newPassword);
      if (success) {
        setMessage('Password changed successfully!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        setMessage('Current password is incorrect');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
            {message}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-gray-50/80 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setProfileData({ name: user?.name || '', email: user?.email || '' });
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{user?.email}</p>
                  </div>
                </div>


              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-gray-50/80 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Security
              </h2>
              {!showPasswordForm && (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </button>
              )}
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Change Password'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;