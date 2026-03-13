import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiEye, FiMapPin } from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { useAuthStore, useUIStore } from '../lib/store';
import { listingsAPI } from '../lib/api';
import { getImageUrl } from '../lib/utils';
import toast from 'react-hot-toast';

const conditionColors = {
  'New': 'badge-new',
  'Like New': 'badge-like-new',
  'Good': 'badge-good',
  'Fair': 'badge-fair',
};

export default function ListingCard({ listing, onFavoriteToggle, viewMode = 'grid' }) {
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const [isFavorited, setIsFavorited] = useState(
    user?.favorites?.includes(listing._id) || false
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await listingsAPI.toggleFavorite(listing._id);
      if (data.success) {
        setIsFavorited(data.isFavorited);
        toast.success(data.isFavorited ? 'Added to favorites' : 'Removed from favorites');
        if (onFavoriteToggle) {
          onFavoriteToggle(listing._id, data.isFavorited);
        }
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return formatDistanceToNow(d, { addSuffix: false }).replace('about ', '');
    }
    return format(d, 'd MMM');
  };

  const imageUrl = getImageUrl(listing.images?.[0]);

  // ── List (horizontal) layout ────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <Link href={`/listing/${listing._id}`} className="block">
        <div className="group flex gap-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
          {/* Image */}
          <div className="relative w-44 sm:w-52 flex-shrink-0 bg-gray-100">
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="200px"
            />
            {listing.isDeleted ? (
              <span className="absolute top-2 left-2 badge bg-gray-500 text-white">{t('common.sold')}</span>
            ) : listing.featured && (
              <span className="absolute top-2 left-2 badge badge-featured">{t('common.featured')}</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 py-3 pr-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 group-hover:text-primary-600 transition-colors">
                {listing.title}
              </h3>
              <button
                onClick={handleFavorite}
                disabled={isLoading}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isFavorited
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-primary-600'
                }`}
              >
                <FiHeart size={16} className={isFavorited ? 'fill-current' : ''} />
              </button>
            </div>

            {listing.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 hidden sm:block">
                {listing.description}
              </p>
            )}

            <p className="text-lg font-bold text-primary-600 mt-2">
              {t('common.egp')} {listing.price?.toLocaleString()}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
              {!listing.isDeleted && (
                <span className={`badge ${conditionColors[listing.condition] || 'badge-fair'} text-xs`}>
                  {listing.condition}
                </span>
              )}
              <span className="flex items-center gap-1">
                <FiMapPin size={11} />
                {listing.location?.area || 'Cairo'}
              </span>
              {listing.views > 0 && (
                <span className="flex items-center gap-1">
                  <FiEye size={11} />
                  {listing.views}
                </span>
              )}
              <span>{formatDate(listing.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ── Grid layout (default) ───────────────────────────────────────────────────
  return (
    <Link href={`/listing/${listing._id}`} className="block">
      <div className="card group">
        <div className="relative aspect-card overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {listing.isDeleted ? (
              <span className="badge bg-gray-500 text-white">{t('common.sold')}</span>
            ) : listing.featured && (
              <span className="badge badge-featured">{t('common.featured')}</span>
            )}
          </div>
          <div className="absolute top-2 right-2">
            {!listing.isDeleted && (
              <span className={`badge ${conditionColors[listing.condition] || 'badge-fair'}`}>
                {listing.condition}
              </span>
            )}
          </div>
          <button
            onClick={handleFavorite}
            disabled={isLoading}
            className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isFavorited
                ? 'bg-primary-600 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-primary-600'
            } shadow-md`}
          >
            <FiHeart size={16} className={isFavorited ? 'fill-current' : ''} />
          </button>
        </div>

        <div className="p-3">
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {listing.title}
          </h3>
          <p className="text-lg font-bold text-primary-600 mt-1">
            {t('common.egp')} {listing.price?.toLocaleString()}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FiMapPin size={12} />
              <span className="truncate max-w-[100px]">{listing.location?.area || 'Cairo'}</span>
            </div>
            <div className="flex items-center gap-3">
              {listing.views > 0 && (
                <span className="flex items-center gap-1">
                  <FiEye size={12} />
                  {listing.views}
                </span>
              )}
              <span>{formatDate(listing.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
