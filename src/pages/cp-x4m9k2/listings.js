import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { getI18nProps } from '../../lib/i18n';
import { withAdmin } from '../../hoc/withAdmin';
import { useAuthStore } from '../../lib/store';
import { adminAPI } from '../../lib/api';
import { FiSearch, FiCheck, FiX, FiEye, FiTrash2, FiLogOut, FiClock, FiAlertCircle, FiGift, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminListings() {
  const { user, logout } = useAuthStore();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [moderationFilter, setModerationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'regular' | 'donations'
  const [donationPendingCount, setDonationPendingCount] = useState(0);
  const [rentPendingCount, setRentPendingCount] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalListings: 0
  });

  // Reject modal state
  const [rejectModal, setRejectModal] = useState({ open: false, listingId: null, reason: '' });
  const REJECT_PRESETS = [
    'Does not meet community guidelines',
    'Prohibited item or content',
    'Misleading or inaccurate description',
    'Inappropriate or offensive content',
    'Duplicate listing',
    'Poor quality / unclear photos',
    'Price is unrealistic',
    'Other',
  ];

  useEffect(() => {
    fetchListings();
  }, [search, statusFilter, moderationFilter, typeFilter, pagination.currentPage]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: 20,
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        moderationStatus: moderationFilter !== 'all' ? moderationFilter : undefined,
        isDonation: typeFilter === 'donations' ? 'true' : (typeFilter === 'regular' || typeFilter === 'rent') ? 'false' : undefined,
        isRent: typeFilter === 'rent' ? 'true' : typeFilter === 'regular' ? 'false' : undefined,
      };

      const [response, statsRes] = await Promise.all([
        adminAPI.getListings(params),
        adminAPI.getDashboardStats(),
      ]);
      if (response.data.success) {
        setListings(response.data.listings);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalListings: response.data.totalListings
        });
      }
      if (statsRes.data.success) {
        setDonationPendingCount(statsRes.data.stats.donations?.pendingApproval || 0);
        setRentPendingCount(statsRes.data.stats.rent?.pendingApproval || 0);
      }
    } catch (error) {
      toast.error('Failed to load listings');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (listingId, action, note = '') => {
    try {
      const response = await adminAPI.moderateListing(listingId, action, note);
      if (response.data.success) {
        toast.success(`Listing ${action}d successfully`);
        fetchListings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to moderate listing');
    }
  };

  const openRejectModal = (listingId) => {
    setRejectModal({ open: true, listingId, reason: '' });
  };

  const submitReject = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Please enter a reason for rejection');
      return;
    }
    await handleModerate(rejectModal.listingId, 'reject', rejectModal.reason.trim());
    setRejectModal({ open: false, listingId: null, reason: '' });
  };

  const handleDelete = async (listingId) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await adminAPI.deleteListing(listingId);
      if (response.data.success) {
        toast.success('Listing deleted successfully');
        fetchListings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete listing');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const getModerationBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
            <FiCheck size={12} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <FiX size={12} />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <FiClock size={12} />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Active</span>;
      case 'sold':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Sold</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Listings Management - Admin - MySouqify</title>
      </Head>

      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Listings Management</h1>
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
              className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900"
            >
              Users
            </Link>
            <Link
              href="/cp-x4m9k2/listings"
              className="py-4 border-b-2 border-primary-600 text-primary-600 font-medium"
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

        {/* Type Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: 'all', label: 'All Listings' },
            { key: 'regular', label: 'Regular Listings' },
            {
              key: 'donations',
              label: (
                <span className="flex items-center gap-1.5">
                  <FiGift size={14} /> Donations
                  {donationPendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full font-bold">
                      {donationPendingCount}
                    </span>
                  )}
                </span>
              )
            },
            {
              key: 'rent',
              label: (
                <span className="flex items-center gap-1.5">
                  <FiCamera size={14} /> Rent Listings
                  {rentPendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">
                      {rentPendingCount}
                    </span>
                  )}
                </span>
              )
            },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTypeFilter(key); setPagination(p => ({ ...p, currentPage: 1 })); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === key
                  ? key === 'donations'
                    ? 'bg-primary-600 text-white shadow'
                    : 'bg-primary-600 text-white shadow'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
            </select>

            {/* Moderation Filter */}
            <select
              value={moderationFilter}
              onChange={(e) => setModerationFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Moderation</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {listings.length} of {pagination.totalListings} {typeFilter === 'donations' ? 'donations' : typeFilter === 'rent' ? 'rent listings' : 'listings'}
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading listings...</p>
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <FiAlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No listings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moderation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listings.map((listing) => (
                    <tr key={listing._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {listing.images?.[0] ? (
                              <img
                                src={typeof listing.images[0] === 'object' ? listing.images[0].url : listing.images[0]}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FiAlertCircle size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 line-clamp-1">{listing.title}</p>
                              {listing.isDonation && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-full flex-shrink-0">
                                  <FiGift size={10} /> FREE
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{listing.category}</p>
                            {listing.isDonation && listing.donationNote && (
                              <p className="text-xs text-gray-400 italic mt-0.5 line-clamp-1">{listing.donationNote}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{listing.seller?.name}</p>
                        <p className="text-xs text-gray-500">{listing.seller?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {listing.isDonation ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full">
                            <FiGift size={11} /> FREE
                          </span>
                        ) : (
                          <p className="font-semibold text-gray-900">{listing.price} EGP</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(listing.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getModerationBadge(listing.moderationStatus)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/listing/${listing._id}`}
                            target="_blank"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View"
                          >
                            <FiEye size={18} />
                          </Link>

                          {listing.moderationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleModerate(listing._id, 'approve')}
                                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                                title="Approve"
                              >
                                <FiCheck size={18} />
                              </button>
                              <button
                                onClick={() => openRejectModal(listing._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Reject with reason"
                              >
                                <FiX size={18} />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
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

      {/* ── Reject Reason Modal ── */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiAlertCircle className="text-red-500" size={20} />
                Reject Listing
              </h3>
              <button onClick={() => setRejectModal({ open: false, listingId: null, reason: '' })} className="p-1 text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Select a preset reason or write a custom one. This will be sent to the seller by email and in-app notification.</p>

            {/* Preset reasons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {REJECT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setRejectModal(m => ({ ...m, reason: preset }))}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    rejectModal.reason === preset
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom reason textarea */}
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(m => ({ ...m, reason: e.target.value }))}
              placeholder="Or type a custom reason..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-400 resize-none"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{rejectModal.reason.length}/500</p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModal({ open: false, listingId: null, reason: '' })}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FiX size={15} /> Reject Listing
              </button>
            </div>
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

export default withAdmin(AdminListings);
