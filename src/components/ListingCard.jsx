import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiEye, FiMapPin, FiClock } from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { useAuthStore, useUIStore } from '../lib/store';
import { listingsAPI } from '../lib/api';
import toast from 'react-hot-toast';

const conditionColors = {
  'New': 'badge-new',
  'Like New': 'badge-like-new',
  'Good': 'badge-good',
  'Fair': 'badge-fair',
};

export default function ListingCard({ listing, onFavoriteToggle }) {
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

  const backendUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
  const imageUrl = listing.images?.[0]?.url
    ? (listing.images[0].url.startsWith('http')
        ? listing.images[0].url
        : `${backendUrl}${listing.images[0].url}`)
    : '/images/placeholder.jpg';

  return (
    <Link href={`/listing/${listing._id}`} className="block">
      <div className="card group">
        {/* Image Container */}
        <div className="relative aspect-card overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
            {listing.isDeleted ? (
              <span className="badge bg-gray-500 text-white">{t('common.sold')}</span>
            ) : listing.featured && (
              <span className="badge badge-featured">{t('common.featured')}</span>
            )}
          </div>

          {/* Condition Badge */}
          <div className="absolute top-2 right-2">
            {!listing.isDeleted && (
              <span className={`badge ${conditionColors[listing.condition] || 'badge-fair'}`}>
                {listing.condition}
              </span>
            )}
          </div>

          {/* Favorite Button */}
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

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {listing.title}
          </h3>

          {/* Price */}
          <p className="text-lg font-bold text-primary-600 mt-1">
            {t('common.egp')} {listing.price?.toLocaleString()}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FiMapPin size={12} />
              <span className="truncate max-w-[100px]">
                {listing.location?.area || 'Cairo'}
              </span>
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
