import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, deleteAccount } from '../store/slices/userSlice';
import { logoutUser } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Trophy, Clock, Target, Award, Trash2, Save, Edit2, X } from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);
  const { profile, loading, updateSuccess } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
    avatar: ''
  });
  
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);
  
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        name: profile.name || '',
        bio: profile.bio || '',
        avatar: profile.avatar || ''
      });
    }
  }, [profile]);
  
  useEffect(() => {
    if (updateSuccess) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    }
  }, [updateSuccess]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateProfile(formData));
  };
  
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }
    
    const result = await dispatch(deleteAccount(deletePassword));
    
    if (result.type === 'user/deleteAccount/fulfilled') {
      toast.success('Account deleted successfully');
      await dispatch(logoutUser());
      navigate('/');
    }
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{profile?.name}</h1>
                <p className="text-gray-500">@{profile?.username}</p>
                <p className="text-sm text-gray-400 mt-1">{profile?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              {isEditing ? <X size={20} /> : <Edit2 size={20} />}
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </button>
          </div>
          
          {profile?.bio && !isEditing && (
            <p className="mt-4 text-gray-600">{profile.bio}</p>
          )}
          
          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  placeholder="Tell us about yourself..."
                  maxLength="200"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/200</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                <Save size={20} />
                <span>Save Changes</span>
              </button>
            </form>
          )}
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatCard
            icon={<Calendar />}
            label="Account Age"
            value={`${profile?.accountAge || 0} days`}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<Trophy />}
            label="Total Games"
            value={profile?.stats?.totalGames || 0}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<Clock />}
            label="Fastest Time"
            value={formatTime(profile?.stats?.fastestSolveTime)}
            color="from-green-500 to-teal-500"
          />
          <StatCard
            icon={<Target />}
            label="Highest Board"
            value={`${profile?.stats?.highestBoardSizeSolved || 0}×${profile?.stats?.highestBoardSizeSolved || 0}`}
            color="from-orange-500 to-red-500"
          />
          <StatCard
            icon={<Award />}
            label="Average Time"
            value={formatTime(profile?.stats?.averageSolveTime)}
            color="from-indigo-500 to-purple-500"
          />
          <StatCard
            icon={<User />}
            label="Hints Used"
            value={profile?.stats?.totalHintsUsed || 0}
            color="from-pink-500 to-rose-500"
          />
        </div>
        
        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
          <div className="space-y-3">
            <InfoRow icon={<Mail />} label="Email" value={profile?.email} />
            <InfoRow icon={<Calendar />} label="Member Since" value={formatDate(profile?.createdAt)} />
            <InfoRow icon={<Clock />} label="Last Login" value={formatDate(profile?.lastLogin)} />
          </div>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/stats')}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-purple-700 font-medium"
            >
              📊 View Detailed Statistics
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-700 font-medium"
            >
              🏆 View Leaderboard
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-red-700 font-medium"
            >
              <Trash2 className="inline mr-2" size={18} />
              Delete Account
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password to confirm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
  >
    <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center text-white mb-3`}>
      {icon}
    </div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </motion.div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center space-x-3 py-2">
    <div className="text-gray-400">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  </div>
);

export default Profile;
