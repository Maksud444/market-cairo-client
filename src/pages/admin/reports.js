import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getI18nProps } from '../../lib/i18n';
import { withAdmin } from '../../hoc/withAdmin';
import { useAuthStore } from '../../lib/store';
import { adminAPI } from '../../lib/api';
import { FiEye, FiTrash2, FiLogOut, FiAlertCircle, FiFlag } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AdminReports() {
  const { user, logout } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0
  });

  useEffect(() => {
    fetchReports();
  }, [pagination.currentPage]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getReports({
        page: pagination.currentPage,
        limit: 20
      });
      if (response.data.success) {
        setReports(response.data.reports);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalReports: response.data.totalReports
        });
      }
    } catch (error) {
      toast.error('Failed to load reports');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const response = await adminAPI.deleteListing(listingId);
      if (response.data.success) {
        toast.success('Listing deleted');
        fetchReports();
      }
    } catch (error) {
      toast.error('Failed to delete listing');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Reports - Admin - MySouqify</title>
      </Head>

      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-app py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
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
            <Link href="/admin" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/admin/users" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900">
              Users
            </Link>
            <Link href="/admin/listings" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900">
              Listings
            </Link>
            <Link href="/admin/verifications" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900">
              Verifications
            </Link>
            <Link href="/admin/reports" className="py-4 border-b-2 border-primary-600 text-primary-600 font-medium">
              Reports
            </Link>
            <Link href="/" className="py-4 border-b-2 border-transparent hover:border-gray-300 text-gray-600 hover:text-gray-900">
              View Site
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-app py-8">
        <div className="mb-4 text-sm text-gray-600">
          {pagination.totalReports} reported listing{pagination.totalReports !== 1 ? 's' : ''}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading reports...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <FiFlag className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No reported listings</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listing</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reports</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reasons</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((listing) => (
                    <tr key={listing._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {listing.images?.[0] ? (
                              <img src={typeof listing.images[0] === 'object' ? listing.images[0].url : listing.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FiAlertCircle size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{listing.title}</p>
                            <p className="text-sm text-gray-500">{listing.price} EGP</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {listing.seller?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                          <FiFlag size={12} />
                          {listing.reports?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {listing.reports?.slice(0, 3).map((report, i) => (
                            <p key={i} className="text-sm text-gray-600">{report.reason}</p>
                          ))}
                          {listing.reports?.length > 3 && (
                            <p className="text-xs text-gray-400">+{listing.reports.length - 3} more</p>
                          )}
                        </div>
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

export default withAdmin(AdminReports);
