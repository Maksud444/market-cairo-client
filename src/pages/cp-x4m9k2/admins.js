import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getI18nProps } from '../../lib/i18n';
import { withAdmin } from '../../hoc/withAdmin';
import { useAuthStore } from '../../lib/store';
import { adminAPI } from '../../lib/api';
import { FiTrash2, FiKey, FiPlus, FiX, FiCheck, FiShield, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';

function AdminsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.isSuperAdmin;

  const [admins, setAdmins] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('admins');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetModal, setResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
  const [activityAdminFilter, setActivityAdminFilter] = useState('');

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (activeTab === 'activity' && isSuperAdmin) {
      fetchActivity();
    }
  }, [activeTab, activityAdminFilter]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminAPI.getAdmins();
      if (data.success) setAdmins(data.admins);
    } catch {
      toast.error('Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminAPI.getActivity({ adminId: activityAdminFilter || undefined, limit: 50 });
      if (data.success) setActivity(data.listings);
    } catch {
      toast.error('Failed to load activity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await adminAPI.createAdmin(createForm);
      if (data.success) {
        toast.success(data.message);
        setShowCreateModal(false);
        setCreateForm({ name: '', email: '', password: '' });
        fetchAdmins();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleRemove = async (admin) => {
    if (!confirm(`Remove admin role from ${admin.name}?`)) return;
    try {
      const { data } = await adminAPI.removeAdmin(admin._id);
      if (data.success) {
        toast.success('Admin role removed');
        fetchAdmins();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove admin');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const { data } = await adminAPI.resetAdminPassword(resetModal._id, newPassword);
      if (data.success) {
        toast.success('Password reset successfully');
        setResetModal(null);
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <FiShield size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Super Admin Access Only</h2>
          <p className="text-gray-500 mt-1">You don't have permission to view this page.</p>
          <Link href="/cp-x4m9k2" className="mt-4 inline-block text-primary-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Manage Admins - MySouqify</title>
      </Head>

      <AdminLayout title="Manage Admins" />

      {/* Content */}
      <div className="container-app py-6 sm:py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'admins' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <FiShield className="inline mr-1.5" size={14} />Admins
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'activity' ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <FiActivity className="inline mr-1.5" size={14} />Activity Log
          </button>
        </div>

        {/* Admins Tab */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-3">
              <h2 className="font-semibold text-gray-900">Admin Accounts ({admins.length})</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                <FiPlus size={14} /> Add Admin
              </button>
            </div>
            {isLoading ? (
              <div className="py-12 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <div key={admin._id} className="flex items-center justify-between p-4 gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                        {admin.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 text-sm">{admin.name}</p>
                          {admin.isSuperAdmin && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Super Admin</span>
                          )}
                          {!admin.isActive && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Inactive</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                        {admin.adminCreatedBy && (
                          <p className="text-xs text-gray-400">Created by: {admin.adminCreatedBy.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setResetModal(admin); setNewPassword(''); }}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                        title="Reset Password"
                      >
                        <FiKey size={13} /> <span className="hidden sm:inline">Reset Password</span>
                      </button>
                      {!admin.isSuperAdmin && admin._id !== user?._id && (
                        <button
                          onClick={() => handleRemove(admin)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 transition-colors"
                          title="Remove Admin"
                        >
                          <FiTrash2 size={13} /> <span className="hidden sm:inline">Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {admins.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-sm">No admins found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-wrap gap-3">
              <h2 className="font-semibold text-gray-900">Moderation Activity</h2>
              <select
                value={activityAdminFilter}
                onChange={(e) => setActivityAdminFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Admins</option>
                {admins.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}</option>
                ))}
              </select>
            </div>
            {isLoading ? (
              <div className="py-12 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activity.map((item) => (
                  <div key={item._id} className="flex items-start justify-between p-4 gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Seller: {item.seller?.name || 'Unknown'} · <span className="hidden sm:inline">{item.seller?.email}</span>
                      </p>
                      {item.moderationNote && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">Note: {item.moderationNote}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.moderationStatus === 'approved' ? <FiCheck size={11} /> : <FiX size={11} />}
                        {item.moderationStatus}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        by <span className="font-medium">{item.moderatedBy?.name || '—'}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.moderatedAt ? new Date(item.moderatedAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-sm">No activity found</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add New Admin</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Admin name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="At least 6 characters"
                />
              </div>
              <p className="text-xs text-gray-500">If this email already exists, the user will be promoted to admin.</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Reset Password</h3>
              <button onClick={() => setResetModal(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Reset password for <span className="font-medium">{resetModal.name}</span>
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="At least 6 characters"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResetModal(null)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdmin(AdminsPage);

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}
