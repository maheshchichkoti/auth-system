import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { TrashIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      setProfileData(response.user);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await authService.deleteAccount();
      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const userData = profileData || user;

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {userData.name}!
            </h1>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-600">
            <h2 className="text-xl font-semibold text-white">Account Information</h2>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <img
                  src={`http://localhost:5000${userData.profileImage}`}
                  alt={userData.name}
                  className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&size=128`;
                  }}
                />
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-lg text-gray-900">{userData.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                    <p className="mt-1 text-lg text-gray-900">{userData.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Company</label>
                    <p className="mt-1 text-lg text-gray-900">{userData.company}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Age</label>
                    <p className="mt-1 text-lg text-gray-900">{userData.age} years</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="mt-1 text-lg text-gray-900">
                      {format(new Date(userData.dateOfBirth), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Once you delete your account, there is no going back.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Remove Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
              All your data will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;