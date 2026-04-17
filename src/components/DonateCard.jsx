import Link from 'next/link';
import { FiMapPin, FiGift, FiUser, FiPhone } from 'react-icons/fi';
import { useTranslation } from 'next-i18next';

const conditionColors = {
  'New': 'bg-primary-50 text-primary-700',
  'Like New': 'bg-primary-100 text-primary-700',
  'Good': 'bg-yellow-100 text-yellow-700',
  'Fair': 'bg-orange-100 text-orange-700',
};

export default function DonateCard({ listing }) {
  const { t } = useTranslation('common');

  if (!listing) return null;

  const image = listing.images?.[0]?.url;
  const conditionKey = listing.condition?.toLowerCase().replace(' ', '_');
  const conditionClass = conditionColors[listing.condition] || 'bg-gray-100 text-gray-600';

  return (
    <Link href={`/listing/${listing._id}`} className="group block bg-white rounded-2xl border border-gray-100 hover:border-primary-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {image ? (
          <img
            src={image}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-primary-50 flex items-center justify-center">
            <FiGift size={40} className="text-primary-300" />
          </div>
        )}
        {/* FREE badge */}
        <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
          {t('donate.free_badge')}
        </div>
        {/* Donated overlay */}
        {listing.isDonated && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <div className="bg-green-500 text-white font-bold text-sm px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              ✓ Donated
            </div>
          </div>
        )}
        {/* Condition badge */}
        {listing.condition && (
          <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${conditionClass}`}>
            {t(`post.condition_${conditionKey}`) || listing.condition}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {listing.title}
        </h3>

        {listing.location?.area && (
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
            <FiMapPin size={11} className="flex-shrink-0" />
            <span className="truncate">{listing.location.area}</span>
          </div>
        )}

        {listing.donationNote && (
          <p className="text-xs text-gray-400 italic line-clamp-1 mb-2">{listing.donationNote}</p>
        )}

        {/* Footer */}
        <div className="mt-2 pt-2 border-t border-gray-50 space-y-2">
          <div className="flex items-center gap-1.5">
            {listing.seller?.avatar ? (
              <img src={listing.seller.avatar} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                <FiUser size={10} className="text-primary-600" />
              </div>
            )}
            <span className="text-xs text-gray-500 truncate">{listing.seller?.name || t('donate.anonymous')}</span>
          </div>
          {listing.whatsappPhone && (
            <a
              href={`https://wa.me/${listing.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I am interested in "${listing.title}". Is it still available?\nhttps://mysouqify.com/listing/${listing._id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 py-1.5 rounded-lg transition-colors"
            >
              <FiPhone size={11} />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </Link>
  );
}
