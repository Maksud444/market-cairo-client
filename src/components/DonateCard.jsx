import Link from 'next/link';
import { FiMapPin, FiGift, FiPackage, FiUser } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const conditionColors = {
  'New': 'bg-emerald-100 text-emerald-700',
  'Like New': 'bg-blue-100 text-blue-700',
  'Good': 'bg-yellow-100 text-yellow-700',
  'Fair': 'bg-orange-100 text-orange-700',
};

export default function DonateCard({ listing }) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const isArabic = router.locale === 'ar';

  if (!listing) return null;

  const image = listing.images?.[0]?.url;
  const conditionKey = listing.condition?.toLowerCase().replace(' ', '_');
  const conditionClass = conditionColors[listing.condition] || 'bg-gray-100 text-gray-600';

  return (
    <Link href={`/listing/${listing._id}`} className="group block bg-white rounded-2xl border border-gray-100 hover:border-green-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {image ? (
          <img
            src={image}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
            <FiGift size={40} className="text-green-400" />
          </div>
        )}
        {/* FREE badge */}
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
          {t('donate.free_badge')}
        </div>
        {/* Condition badge */}
        {listing.condition && (
          <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${conditionClass}`}>
            {t(`post.condition_${conditionKey}`) || listing.condition}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-green-700 transition-colors">
          {listing.title}
        </h3>

        {/* Location */}
        {listing.location?.area && (
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
            <FiMapPin size={11} className="flex-shrink-0" />
            <span className="truncate">{listing.location.area}</span>
          </div>
        )}

        {/* Pickup note */}
        {listing.donationNote && (
          <p className="text-xs text-gray-500 italic line-clamp-1 mb-2">
            {listing.donationNote}
          </p>
        )}

        {/* Footer: donor + request button */}
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5">
            {listing.seller?.avatar ? (
              <img src={listing.seller.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <FiUser size={10} className="text-green-600" />
              </div>
            )}
            <span className="text-xs text-gray-500 truncate max-w-[80px]">{listing.seller?.name || t('donate.anonymous')}</span>
          </div>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {t('donate.request_item')}
          </span>
        </div>
      </div>
    </Link>
  );
}
