import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getI18nProps } from '../../lib/i18n';
import { withAdmin } from '../../hoc/withAdmin';
import { useAuthStore } from '../../lib/store';
import { adminAPI } from '../../lib/api';
import { FiSearch, FiShield, FiUser, FiCheck, FiX, FiLogOut, FiEye, FiMail, FiPhone, FiMapPin, FiCalendar, FiShoppingBag, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

function AdminUsers() {
  const { user, logout } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, pagination.currentPage]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: 20,
        search,
        role: roleFilter,
        status: statusFilter
      };

      const response = await adminAPI.getUsers(params);
      if (response.data.success) {
        setUsers(response.data.users);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalUsers: response.data.totalUsers
        });
      }
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserRole = async (userId) => {
    try {
      const response = await adminAPI.toggleUserRole(userId);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await adminAPI.toggleUserStatus(userId);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const openUserDetail = async (u) => {
    setSelectedUser(u);
    setDetailLoading(true);
    setUserDetail(null);
    try {
      const res = await adminAPI.getUserDetail(u._id);
      if (res.data.success) setUserDetail(res.data);
    } catch {
      toast.error('Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>User Management - Admin - MySouqify</title>
      </Head>

      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <FiLogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-app">
          <nav className="flex gap-6">
            <Link
              href="/cp-x4m9k2"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/cp-x4m9k2/users"
              className="py-4 border-b-2 border-primary-600 text-primary-600 font-medium"
            >
              Users
            </Link>
            <Link
              href="/cp-x4m9k2/listings"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Listings
            </Link>
            <Link
              href="/cp-x4m9k2/verifications"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Verifications
            </Link>
            <Link
              href="/cp-x4m9k2/reports"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Reports
            </Link>
            <Link
              href="/cp-x4m9k2/admins"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Admins
            </Link>
            <Link
              href="/"
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              View Site
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-app py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Users Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {users.length} of {pagination.totalUsers} users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-sm text-gray-500">{u.location?.area ? `${u.location.area}, ${u.location.city}` : 'No location'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{u.email}</p>
                        <p className="text-sm text-gray-500">{u.phone || 'No phone'}</p>
                      </td>
                      <td className="px-6 py-4">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                            <FiShield size={14} />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                            <FiUser size={14} />
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                            <FiCheck size={14} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                            <FiX size={14} />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUserDetail(u)}
                            className="px-3 py-1 text-sm bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg flex items-center gap-1"
                          >
                            <FiEye size={13} /> View
                          </button>
                          <button
                            onClick={() => toggleUserRole(u._id)}
                            disabled={u._id === user._id}
                            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u._id)}
                            disabled={u._id === user._id}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
              disabled={pagination.currentPage === 1}
              className="btn btn-outline disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
              disabled={pagination.currentPage === pagination.totalPages}
              className="btn btn-outline disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <FiX size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {selectedUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{selectedUser.name}</h3>
                      {selectedUser.isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                          <FiShield size={11} /> Admin
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${selectedUser.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2"><FiMail size={14} /> {selectedUser.email}</p>
                      {selectedUser.phone && <p className="flex items-center gap-2"><FiPhone size={14} /> {selectedUser.phone}</p>}
                      {selectedUser.location?.area && <p className="flex items-center gap-2"><FiMapPin size={14} /> {selectedUser.location.area}, {selectedUser.location.city}</p>}
                      <p className="flex items-center gap-2"><FiCalendar size={14} /> Joined {formatDistanceToNow(new Date(selectedUser.createdAt), { addSuffix: true })}</p>
                      {userDetail && <p className="flex items-center gap-2"><FiShoppingBag size={14} /> {userDetail.listingsCount} total listings</p>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-wrap border-t border-gray-100 pt-4">
                  <button
                    onClick={() => { toggleUserRole(selectedUser._id); setSelectedUser(prev => ({ ...prev, isAdmin: !prev.isAdmin })); }}
                    disabled={selectedUser._id === user._id}
                    className="px-4 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium disabled:opacity-50"
                  >
                    {selectedUser.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => { toggleUserStatus(selectedUser._id); setSelectedUser(prev => ({ ...prev, isActive: !prev.isActive })); }}
                    disabled={selectedUser._id === user._id}
                    className={`px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50 ${selectedUser.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  >
                    {selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}
                  </button>
                  <Link href={`/user/${selectedUser._id}`} target="_blank"
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg font-medium flex items-center gap-1">
                    <FiExternalLink size={13} /> View Public Profile
                  </Link>
                </div>

                {/* Recent Listings */}
                {userDetail?.activeListings?.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Listings</h4>
                    <div className="space-y-2">
                      {userDetail.activeListings.map(listing => (
                        <div key={listing._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            {listing.images?.[0] && (
                              <img src={listing.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{listing.title}</p>
                              <p className="text-xs text-gray-500">{listing.status} · {new Date(listing.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-bold text-primary-600">{listing.price?.toLocaleString()} EGP</span>
                            <Link href={`/listing/${listing._id}`} target="_blank" className="text-gray-400 hover:text-gray-600">
                              <FiExternalLink size={14} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}

export default withAdmin(AdminUsers);
