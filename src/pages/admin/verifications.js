import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getI18nProps } from '../../lib/i18n';
import { withAdmin } from '../../hoc/withAdmin';
import { useAuthStore } from '../../lib/store';
import { adminAPI } from '../../lib/api';
import { FiCheck, FiX, FiEye, FiLogOut, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function AdminVerifications() {
  const { user, logout } = useAuthStore();
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [pendingCount, setPendingCount] = useState(0);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  // Review modal
  const [reviewUser, setReviewUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, [statusFilter, pagination.currentPage]);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: 20,
        status: statusFilter,
      };
      const response = await adminAPI.getVerifications(params);
      if (response.data.success) {
        setVerifications(response.data.verifications);
        setPendingCount(response.data.pendingCount);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total,
        });
      }
    } catch (error) {
      toast.error('Failed to load verifications');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (action) => {
    if (action === 'reject' && !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsReviewing(true);
    try {
      const response = await adminAPI.reviewVerification(
        reviewUser._id,
        action,
        action === 'reject' ? rejectReason : undefined
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setReviewUser(null);
        setRejectReason('');
        fetchVerifications();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to review verification');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const getDocTypeBadge = (type) => {
    const types = {
      passport: { label: 'Passport', color: 'bg-blue-100 text-blue-700' },
      student_card: { label: 'Student Card', color: 'bg-purple-100 text-purple-700' },
      residential_card: { label: 'Residential Card', color: 'bg-green-100 text-green-700' },
    };
    const t = types[type] || { label: type, color: 'bg-gray-100 text-gray-700' };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${t.color}`}>{t.label}</span>;
  };

  const getStatusBadge = (status) => {
    const statuses = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statuses[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Verifications - Admin - MySouqify</title>
      </Head>

      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Verifications</h1>
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                Admin
              </span>
              {pendingCount > 0 && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                  {pendingCount} pending
                </span>
              )}
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
          <nav className="flex gap-6 overflow-x-auto">
            <Link href="/admin" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/admin/users" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Users
            </Link>
            <Link href="/admin/listings" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Listings
            </Link>
            <Link href="/admin/verifications" className="py-4 border-b-2 border-primary-600 text-primary-600 font-medium whitespace-nowrap">
              Verifications
            </Link>
            <Link href="/admin/reports" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 whitespace-nowrap">
              Reports
            </Link>
            <Link href="/" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900 whitespace-nowrap">
              View Site
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-app py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPagination(p => ({ ...p, currentPage: 1 }));
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {status}
              {status === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Verifications Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading verifications...</p>
            </div>
          ) : verifications.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No {statusFilter !== 'all' ? statusFilter : ''} verifications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Document Type</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {verifications.map((v) => (
                    <tr key={v._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{v.name}</p>
                          <p className="text-sm text-gray-500">{v.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getDocTypeBadge(v.verification?.documentType)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(v.verification?.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {v.verification?.submittedAt
                          ? new Date(v.verification.submittedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setReviewUser(v)}
                          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          <FiEye size={16} />
                          Review
                        </button>
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
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setPagination(p => ({ ...p, currentPage: page }))}
                className={`w-10 h-10 rounded-lg text-sm font-medium ${
                  page === pagination.currentPage
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Review Verification</h2>
              <p className="text-sm text-gray-500 mt-1">{reviewUser.name} ({reviewUser.email})</p>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Document Type</p>
                  <p className="font-medium text-gray-900 capitalize mt-1">
                    {reviewUser.verification?.documentType?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Current Status</p>
                  <div className="mt-1">{getStatusBadge(reviewUser.verification?.status)}</div>
                </div>
                <div>
                  <p className="text-gray-500">Submitted</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {reviewUser.verification?.submittedAt
                      ? new Date(reviewUser.verification.submittedAt).toLocaleString()
                      : '-'}
                  </p>
                </div>
                {reviewUser.phone && (
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900 mt-1">{reviewUser.phone}</p>
                  </div>
                )}
              </div>

              {/* Document Images */}
              <div>
                <p className="text-sm text-gray-500 mb-3">Document Images</p>
                <div className="grid grid-cols-3 gap-3">
                  {reviewUser.verification?.documentImages?.map((img, i) => {
                    const imgSrc = img.url?.startsWith('data:') || img.url?.startsWith('http')
                      ? img.url
                      : `${API_URL.replace('/api', '')}${img.url}`;
                    return (
                    <a
                      key={i}
                      href={imgSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:border-primary-500 transition-colors relative group"
                    >
                      <img
                        src={imgSrc}
                        alt={`Document ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <FiImage className="text-white opacity-0 group-hover:opacity-100" size={24} />
                      </div>
                    </a>
                    );
                  })}
                </div>
              </div>

              {/* Rejection Reason */}
              {reviewUser.verification?.status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (required if rejecting)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Document is blurry, wrong document type, etc."
                    rows={3}
                    className="input w-full resize-none"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setReviewUser(null);
                  setRejectReason('');
                }}
                className="btn btn-outline"
              >
                Close
              </button>
              {reviewUser.verification?.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleReview('reject')}
                    disabled={isReviewing}
                    className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  >
                    <FiX size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleReview('approve')}
                    disabled={isReviewing}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <FiCheck size={16} />
                    Approve
                  </button>
                </>
              )}
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

export default withAdmin(AdminVerifications);
