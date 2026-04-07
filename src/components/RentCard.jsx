import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMapPin, FiCamera } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { getImageUrl, PLACEHOLDER_IMG } from '../lib/utils';

const RENT_CATEGORY_LABELS = {
  camera: 'Camera',
  wedding: 'Wedding',
  azhar: 'Azhar',
};

export default function RentCard({ listing, compact = false }) {
  const { t } = useTranslation('common');
  const [imgSrc, setImgSrc] = useState(getImageUrl(listing.images?.[0]));

  const priceLabel = listing.pricePerDayMax && listing.pricePerDayMax > listing.pricePerDay
    ? `${listing.pricePerDay}–${listing.pricePerDayMax} EGP/day`
    : `${listing.pricePerDay} EGP/day`;

  const locationText = listing.location?.area || 'Cairo';
  const categoryLabel = RENT_CATEGORY_LABELS[listing.rentCategory] || 'Rent';
  const storeName = listing.storeName || listing.seller?.name || '';

  if (compact) {
    // Mobile compact card (horizontal scroll)
    return (
      <Link href={`/listing/${listing._id}`}>
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow w-full">
          {/* Image */}
          <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
            <Image
              src={imgSrc}
              alt={listing.title}
              fill
              className="object-cover"
              onError={() => setImgSrc(PLACEHOLDER_IMG)}
              sizes="160px"
            />
            {/* Category badge */}
            <div className="absolute top-1.5 left-1.5">
              <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                For Rent
              </span>
            </div>
            {/* Store badge */}
            {storeName && (
              <div className="absolute top-1.5 right-1.5">
                <span className="bg-white/90 text-gray-700 text-[9px] font-semibold px-1.5 py-0.5 rounded-md border border-gray-200">
                  Store
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-2">
            <p className="text-[11px] text-gray-700 font-semibold line-clamp-1 leading-tight">{listing.title}</p>
            <p className="text-[12px] font-bold text-blue-600 mt-0.5">{priceLabel}</p>
          </div>
        </div>
      </Link>
    );
  }

  // Full desktop card
  return (
    <Link href={`/listing/${listing._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
          <Image
            src={imgSrc}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc(PLACEHOLDER_IMG)}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {/* For Rent badge */}
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              For Rent
            </span>
          </div>
          {/* Store badge */}
          {storeName && (
            <div className="absolute top-2.5 right-2.5">
              <span className="bg-white/95 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-lg border border-gray-200 shadow-sm">
                Store
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          {storeName && (
            <p className="text-xs text-blue-600 font-semibold mb-0.5 truncate">{storeName}</p>
          )}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">{listing.title}</h3>
          <p className="text-base font-bold text-blue-600">{priceLabel}</p>
          <div className="flex items-center gap-1 mt-1.5 text-gray-400">
            <FiMapPin size={11} />
            <span className="text-[11px] truncate">{locationText}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
