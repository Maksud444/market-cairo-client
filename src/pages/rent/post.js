import { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCamera, FiCheck, FiAlertCircle, FiChevronDown, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../../lib/i18n';
import Layout from '../../components/Layout';
import { listingsAPI } from '../../lib/api';
import { useAuthStore, useUIStore } from '../../lib/store';
import { locationHierarchy } from '../../lib/categoryConfig';

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const RENT_CATEGORIES = [
  { key: 'camera', label: 'Camera Rental', icon: '📷', description: 'DSLR, mirrorless, video cameras & accessories' },
  { key: 'wedding', label: 'Wedding Dress Rental', icon: '💍', description: 'Bridal gowns, suits & wedding attire' },
  { key: 'azhar', label: 'Azhar Dress Rental', icon: '🕌', description: 'Traditional Azhar religious clothing' },
];

export default function PostRentPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { openLoginModal } = useUIStore();

  const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const AVAILABLE_COLORS = [
    { name: 'Black', hex: '#1a1a1a' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Gray', hex: '#9ca3af' },
    { name: 'Dark Green', hex: '#166534' },
    { name: 'Navy', hex: '#1e3a5f' },
    { name: 'Brown', hex: '#7c4a1e' },
    { name: 'Beige', hex: '#d4b896' },
    { name: 'Red', hex: '#dc2626' },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rentCategory: '',
    pricePerDay: '',
    pricePerDayMax: '',
    storeName: '',
    condition: 'Good',
    whatsappPhone: '',
    location: { area: '', city: 'Cairo' },
    rentSizes: [],
    rentColors: [],
  });

  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStep, setLocationStep] = useState(0); // 0=region, 1=city, 2=compound
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated) {
      openLoginModal();
    }
  }, [isAuthenticated, openLoginModal]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToProcess = acceptedFiles.slice(0, remaining);
    const compressed = [];

    for (const file of filesToProcess) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }
      try {
        const comp = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true });
        compressed.push({ file: comp, preview: URL.createObjectURL(comp) });
      } catch {
        compressed.push({ file, preview: URL.createObjectURL(file) });
      }
    }

    setImages((prev) => [...prev, ...compressed]);
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: MAX_IMAGES,
  });

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      rentSizes: prev.rentSizes.includes(size)
        ? prev.rentSizes.filter((s) => s !== size)
        : [...prev.rentSizes, size],
    }));
  };

  const toggleColor = (colorName) => {
    setFormData((prev) => ({
      ...prev,
      rentColors: prev.rentColors.includes(colorName)
        ? prev.rentColors.filter((c) => c !== colorName)
        : [...prev.rentColors, colorName],
    }));
  };

  const handleLocationSelect = (area, city = 'Cairo') => {
    setFormData((prev) => ({ ...prev, location: { area, city } }));
    setShowLocationPicker(false);
    setLocationStep(0);
    setSelectedRegion(null);
    setSelectedCity(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) { openLoginModal(); return; }
    if (!formData.rentCategory) { toast.error('Please select a rental category'); return; }
    if (!formData.title.trim()) { toast.error('Please add a title'); return; }
    if (!formData.pricePerDay || Number(formData.pricePerDay) < 1) {
      toast.error('Price per day must be at least 1 EGP');
      return;
    }
    if (!formData.location.area) { toast.error('Please select a location'); return; }
    if (images.length === 0) { toast.error('Please add at least one photo'); return; }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting your listing...');

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim() || formData.title.trim());
      data.append('isRent', 'true');
      data.append('rentCategory', formData.rentCategory);
      data.append('pricePerDay', String(Number(formData.pricePerDay)));
      data.append('pricePerDayMax', String(Number(formData.pricePerDayMax) || 0));
      data.append('storeName', formData.storeName.trim());
      data.append('condition', formData.condition);
      data.append('rentSizes', JSON.stringify(formData.rentSizes));
      data.append('rentColors', JSON.stringify(formData.rentColors));
      data.append('price', String(Number(formData.pricePerDay)));
      data.append('category', 'Rent');
      data.append('whatsappPhone', formData.whatsappPhone);
      data.append('location', JSON.stringify(formData.location));

      images.forEach((img) => data.append('images', img.file));

      const res = await listingsAPI.create(data);
      if (res.data.success) {
        toast.success('Rent listing submitted for approval!', { id: toastId });
        setSubmitted(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit listing';
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Listing Submitted!</h2>
            <p className="text-gray-600 text-sm mb-6">Your rent listing is pending admin approval. It will appear on the site once approved.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/rent" className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-colors">
                Browse Rentals
              </Link>
              <button onClick={() => setSubmitted(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors">
                Post Another
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Post Rent Listing – MySouqify</title>
      </Head>

      <div className="bg-white border-b border-gray-100">
        <div className="container-app py-4">
          <div className="flex items-center gap-3">
            <Link href="/rent" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{t('rent.post_page_title')}</h1>
              <p className="text-xs text-gray-500">{t('rent.post_page_subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-6 lg:py-10 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Rent Category */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCamera size={18} className="text-primary-600" />
              {t('rent.select_category')}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {RENT_CATEGORIES.map((cat) => (
                <label key={cat.key} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.rentCategory === cat.key
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="rentCategory"
                    value={cat.key}
                    checked={formData.rentCategory === cat.key}
                    onChange={() => handleChange('rentCategory', cat.key)}
                    className="sr-only"
                  />
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cat.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                  </div>
                  {formData.rentCategory === cat.key && (
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiCheck size={12} className="text-white" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Store Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">{t('rent.store_info')}</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('rent.store_name')} <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                placeholder="e.g. Ahmed Camera Rentals"
                className="input"
                maxLength={80}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('rent.item_title')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Canon EOS R5 Mirrorless Camera"
                className="input"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('rent.description')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the item, included accessories, rental terms..."
                className="input resize-none"
                rows={4}
                maxLength={2000}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">{t('rent.pricing')}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t('rent.price_per_day')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => handleChange('pricePerDay', e.target.value)}
                    placeholder="e.g. 90"
                    className="input pr-16"
                    min={1}
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">EGP/day</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {t('rent.price_max')} <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.pricePerDayMax}
                    onChange={(e) => handleChange('pricePerDayMax', e.target.value)}
                    placeholder="e.g. 200"
                    className="input pr-16"
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">EGP/day</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {t('rent.price_hint')}
            </p>
          </div>

          {/* Condition */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">{t('rent.condition')}</h2>
            <div className="grid grid-cols-4 gap-2">
              {['New', 'Like New', 'Good', 'Fair'].map((cond) => (
                <button
                  type="button"
                  key={cond}
                  onClick={() => handleChange('condition', cond)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    formData.condition === cond
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes (optional) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1">Available Sizes <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
            <p className="text-xs text-gray-400 mb-4">Select all sizes you have in stock</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    formData.rentSizes.includes(size)
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors (optional) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-1">Available Colors <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
            <p className="text-xs text-gray-400 mb-4">Select all colors available</p>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  type="button"
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className="flex flex-col items-center gap-1.5"
                  title={color.name}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-4 transition-all ${
                      formData.rentColors.includes(color.name)
                        ? 'border-primary-500 scale-110'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex, boxShadow: color.hex === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : undefined }}
                  />
                  <span className="text-[10px] text-gray-500">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiMapPin size={16} className="text-primary-600" />
              {t('rent.location')} <span className="text-red-500">*</span>
            </h2>

            <button
              type="button"
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="w-full flex items-center justify-between p-3 border-2 border-gray-200 rounded-xl hover:border-primary-400 transition-colors"
            >
              <span className={formData.location.area ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                {formData.location.area
                  ? `${formData.location.area}, ${formData.location.city}`
                  : 'Select area in Cairo'}
              </span>
              <FiChevronDown size={16} className={`text-gray-400 transition-transform ${showLocationPicker ? 'rotate-180' : ''}`} />
            </button>

            {showLocationPicker && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                {locationStep === 0 && locationHierarchy.map((region) => (
                  <button
                    type="button"
                    key={region.en}
                    onClick={() => { setSelectedRegion(region); setLocationStep(1); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 border-b border-gray-50 last:border-0 font-medium"
                  >
                    {region.en}
                  </button>
                ))}
                {locationStep === 1 && selectedRegion?.cities.map((city) => (
                  <button
                    type="button"
                    key={city.en}
                    onClick={() => {
                      if (city.compounds?.length > 0) { setSelectedCity(city); setLocationStep(2); }
                      else { handleLocationSelect(city.en, selectedRegion.en); }
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 border-b border-gray-50 last:border-0"
                  >
                    {city.en}
                    {city.compounds?.length > 0 && <span className="text-gray-400 text-xs ml-1">›</span>}
                  </button>
                ))}
                {locationStep === 2 && selectedCity?.compounds.map((compound) => (
                  <button
                    type="button"
                    key={compound}
                    onClick={() => handleLocationSelect(compound, selectedCity.en)}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 border-b border-gray-50 last:border-0"
                  >
                    {compound}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp Contact */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Contact</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium flex-shrink-0">
                  🇪🇬 +20
                </span>
                <input
                  type="tel"
                  value={formData.whatsappPhone}
                  onChange={(e) => handleChange('whatsappPhone', e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="input flex-1"
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">{t('rent.photos')} <span className="text-red-500">*</span></h2>
              <span className="text-xs text-gray-400">{images.length}/{MAX_IMAGES}</span>
            </div>

            {/* Dropzone */}
            {images.length < MAX_IMAGES && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <FiUpload size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  {isDragActive ? 'Drop photos here' : 'Tap to add photos or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Max {MAX_IMAGES} photos, 5MB each · JPG, PNG, WebP</p>
              </div>
            )}

            {/* Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {images.map((img, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100" style={{ aspectRatio: '1' }}>
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary-600 text-white text-[9px] px-1.5 py-0.5 rounded font-semibold">Cover</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <FiX size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notice */}
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <FiAlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              {t('rent.approval_notice')}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-base"
          >
            {isSubmitting ? 'Submitting...' : t('rent.submit_listing')}
          </button>
        </form>
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}
