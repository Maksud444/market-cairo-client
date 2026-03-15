import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCamera, FiAlertCircle, FiCheck, FiChevronDown, FiMapPin, FiShield, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import { listingsAPI, categoriesAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';


const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function PostListingPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuthStore();
  const { edit: editId } = router.query;

  const conditions = [
    { value: 'New', label: t('post.condition_new'), description: t('post.condition_new_desc') },
    { value: 'Like New', label: t('post.condition_like_new'), description: t('post.condition_like_new_desc') },
    { value: 'Good', label: t('post.condition_good'), description: t('post.condition_good_desc') },
    { value: 'Fair', label: t('post.condition_fair'), description: t('post.condition_fair_desc') },
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    condition: '',
    location: {
      area: '',
      city: 'Cairo',
    },
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [locations, setLocations] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editId);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/?login=true');
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch categories and locations
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          categoriesAPI.getAll(),
          categoriesAPI.getLocations(),
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (locRes.data.success) setLocations(locRes.data.locations);
      } catch (error) {
        console.error('Failed to fetch filters:', error);
      }
    };
    fetchFilters();
  }, []);

  // Fetch listing data if editing
  useEffect(() => {
    if (editId && isAuthenticated) {
      const fetchListing = async () => {
        setIsLoading(true);
        try {
          const res = await listingsAPI.getById(editId);
          if (res.data.success) {
            const listing = res.data.listing;
            
            // Check if user owns this listing
            if (listing.seller._id !== user?._id) {
              toast.error(t('post.edit_own_listings'));
              router.push('/');
              return;
            }

            setFormData({
              title: listing.title,
              description: listing.description,
              price: listing.price.toString(),
              category: listing.category,
              subcategory: listing.subcategory || '',
              condition: listing.condition,
              location: listing.location || { area: '', city: 'Cairo' },
            });
            setExistingImages(listing.images || []);
          }
        } catch (error) {
          toast.error(t('post.failed_to_load'));
          router.push('/');
        } finally {
          setIsLoading(false);
        }
      };
      fetchListing();
    }
  }, [editId, isAuthenticated, user, router]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} ${t('post.image_too_large')}`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} ${t('post.invalid_image_type')}`);
        }
      });
    });

    // Check total images
    const totalImages = images.length + existingImages.length + acceptedFiles.length;
    if (totalImages > MAX_IMAGES) {
      toast.error(`${MAX_IMAGES} ${t('post.max_images')}`);
      return;
    }

    // Add new files with preview
    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
  }, [images.length, existingImages.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_IMAGES - images.length - existingImages.length,
  });

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const addr = data.address || {};
          // Try to match a known location
          const areaKeywords = [
            'New Cairo', '5th Settlement', 'Madinaty', 'Rehab City', 'Shorouk City',
            'Nasr City', 'Heliopolis', 'Maadi', 'Zamalek', 'Downtown', 'Mohandessin',
            'Dokki', 'Giza', 'Sheikh Zayed', '6th of October', 'Mokattam',
            'Ain Shams', 'Helwan', 'Shubra', 'Katameya', 'Garden City', 'Agouza',
          ];
          const fullText = `${addr.suburb || ''} ${addr.city_district || ''} ${addr.town || ''} ${addr.city || ''}`;
          const matched = areaKeywords.find(k => fullText.toLowerCase().includes(k.toLowerCase()));
          const area = matched || addr.suburb || addr.city_district || addr.town || 'Cairo';
          setFormData(prev => ({ ...prev, location: { ...prev.location, area } }));
          toast.success(`Location set to: ${area}`);
        } catch {
          toast.error('Could not detect location. Please select manually.');
        } finally {
          setIsGeolocating(false);
        }
      },
      () => {
        toast.error('Location access denied. Please select manually.');
        setIsGeolocating(false);
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value },
      }));
    } else if (name === 'category') {
      setFormData(prev => ({ ...prev, category: value, subcategory: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('post.validation_title_required');
    } else if (formData.title.length < 5) {
      newErrors.title = t('post.validation_title_min');
    } else if (formData.title.length > 100) {
      newErrors.title = t('post.validation_title_max');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('post.validation_description_required');
    } else if (formData.description.length < 20) {
      newErrors.description = t('post.validation_description_min');
    }

    if (!formData.price) {
      newErrors.price = t('post.validation_price_required');
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = t('post.validation_price_invalid');
    }

    if (!formData.category) {
      newErrors.category = t('post.validation_category_required');
    }

    if (!formData.condition) {
      newErrors.condition = t('post.validation_condition_required');
    }

    if (!formData.location.area) {
      newErrors['location.area'] = t('post.validation_location_required');
    }

    if (images.length === 0 && existingImages.length === 0) {
      newErrors.images = t('post.at_least_one_image');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error(t('post.validation_fix_errors'));
      return;
    }

    setIsSubmitting(true);

    // Check verification status (skip for admins)
    if (user && !user.isAdmin && user.verification?.status !== 'approved') {
      setIsSubmitting(false);
      setShowVerifyModal(true);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('subcategory', formData.subcategory || '');
      data.append('condition', formData.condition);
      data.append('location', JSON.stringify({
        area: formData.location.area,
        city: formData.location.city
      }));

      // Add existing images that weren't removed
      existingImages.forEach((img) => {
        data.append('existingImages', img);
      });

      // Add new images
      images.forEach(({ file }) => {
        data.append('images', file);
      });

      let res;
      if (editId) {
        res = await listingsAPI.update(editId, data);
        toast.success(t('post.updated_success'));
      } else {
        res = await listingsAPI.create(data);
        toast.success(t('post.success'));
      }

      if (res.data.success) {
        router.push(`/listing/${res.data.listing._id}`);
      }
    } catch (error) {
      console.error('Post listing error:', error.response?.data);

      // Redirect to verify if verification required
      if (error.response?.data?.requiresVerification) {
        router.push('/verify');
        return;
      }

      // Show validation errors if available
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(err.message || err.msg);
        });
      } else {
        toast.error(error.response?.data?.message || t('post.failed_to_save'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container-app py-8 max-w-2xl">
          <div className="space-y-6">
            <div className="h-8 skeleton w-1/3" />
            <div className="h-40 skeleton w-full" />
            <div className="h-12 skeleton w-full" />
            <div className="h-32 skeleton w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{editId ? t('post.edit_title') : t('post.title')} - MySouqify</title>
      </Head>

      <div className="container-app py-6 lg:py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            {editId ? t('post.edit_title') : t('post.title')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('post.images_label')} <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1">
                  ({images.length + existingImages.length}/{MAX_IMAGES})
                </span>
              </label>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : errors.images 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    isDragActive ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <FiCamera className={isDragActive ? 'text-primary-600' : 'text-gray-400'} size={24} />
                  </div>
                  <p className="text-gray-600 mb-1">
                    {isDragActive ? t('post.drop_images') : t('post.upload_images')}
                  </p>
                  <p className="text-sm text-gray-400">{t('post.upload_images_alt')}</p>
                  <p className="text-xs text-gray-400 mt-2">{t('post.upload_images_format')}</p>
                </div>
              </div>

              {errors.images && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle size={14} />
                  {errors.images}
                </p>
              )}

              {/* Image Previews */}
              {(existingImages.length > 0 || images.length > 0) && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 relative">
                        <Image src={url} alt="" fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={14} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
                          {t('post.cover')}
                        </span>
                      )}
                    </div>
                  ))}
                  {images.map((image, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 relative">
                        <Image src={image.preview} alt="" fill className="object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={14} />
                      </button>
                      {existingImages.length === 0 && index === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
                          {t('post.cover')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('post.listing_title')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={t('post.title_placeholder')}
                className={`input w-full ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
                maxLength={100}
              />
              <div className="flex justify-between mt-1">
                {errors.title ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {errors.title}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400">{formData.title.length}/100</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                {t('post.category_label')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input w-full appearance-none pr-10 ${errors.category ? 'border-red-300' : ''}`}
                >
                  <option value="">{t('post.select_category')}</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle size={14} />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Subcategory */}
            {formData.category && categories.find(c => c.name === formData.category)?.subcategories?.length > 0 && (
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <div className="relative">
                  <select
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="input w-full appearance-none pr-10"
                  >
                    <option value="">Select subcategory (optional)</option>
                    {categories.find(c => c.name === formData.category).subcategories.map((sub) => {
                      const subName = typeof sub === 'string' ? sub : sub.name;
                      return <option key={subName} value={subName}>{subName}</option>;
                    })}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
            )}

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('post.condition_label')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {conditions.map((cond) => (
                  <label
                    key={cond.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.condition === cond.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={cond.value}
                      checked={formData.condition === cond.value}
                      onChange={handleChange}
                      className="mt-1 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{cond.label}</p>
                      <p className="text-xs text-gray-500">{cond.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.condition && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle size={14} />
                  {errors.condition}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                {t('post.price_label')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={t('post.price_placeholder')}
                  className={`input w-full pr-16 ${errors.price ? 'border-red-300' : ''}`}
                  min="1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  EGP
                </span>
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle size={14} />
                  {errors.price}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  {t('post.location_label')} <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isGeolocating}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  <FiMapPin size={13} />
                  {isGeolocating ? 'Detecting...' : 'Use current location'}
                </button>
              </div>
              <div className="relative">
                <select
                  id="location"
                  name="location.area"
                  value={formData.location.area}
                  onChange={handleChange}
                  className={`input w-full appearance-none pr-10 ${errors['location.area'] ? 'border-red-300' : ''}`}
                >
                  <option value="">{t('post.location_placeholder')}</option>
                  {locations.map((loc) => {
                    const en = typeof loc === 'object' ? loc.en : loc;
                    const ar = typeof loc === 'object' ? loc.ar : '';
                    return (
                      <option key={en} value={en}>{en}{ar ? ` - ${ar}` : ''}</option>
                    );
                  })}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
              {errors['location.area'] && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle size={14} />
                  {errors['location.area']}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('post.description_label')} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('post.description_placeholder')}
                rows={5}
                className={`input w-full resize-none ${errors.description ? 'border-red-300' : ''}`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FiAlertCircle size={14} />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex-1 py-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  t('post.posting')
                ) : editId ? (
                  <>
                    <FiCheck size={18} className="mr-2" />
                    {t('post.update_listing')}
                  </>
                ) : (
                  <>
                    <FiUpload size={18} className="mr-2" />
                    {t('post.post_listing')}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline flex-1 py-3"
              >
                {t('post.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5 text-white text-center">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiShield size={28} />
              </div>
              {user?.verification?.status === 'pending' ? (
                <>
                  <h2 className="text-xl font-bold">Verification Under Review</h2>
                  <p className="text-red-100 text-sm mt-1">Your submission is being processed</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold">Identity Verification Required</h2>
                  <p className="text-red-100 text-sm mt-1">One-time verification to keep MySouqify safe</p>
                </>
              )}
            </div>
            {/* Body */}
            <div className="p-6">
              {user?.verification?.status === 'pending' ? (
                <>
                  <p className="text-gray-600 text-sm text-center mb-6">
                    Your verification is under review. We&apos;ll notify you once approved. Please wait while our team reviews your documents.
                  </p>
                  <button onClick={() => setShowVerifyModal(false)}
                    className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors">
                    Close
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 text-sm text-center mb-5">
                    Before posting your first ad, we need to verify your identity. This helps us maintain a trusted marketplace.
                  </p>
                  <div className="space-y-3 mb-6">
                    <Link href="/verify?type=egyptian" onClick={() => setShowVerifyModal(false)}
                      className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group">
                      <span className="text-3xl">🇪🇬</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-red-700">Egyptian Citizen</p>
                        <p className="text-xs text-gray-500">Submit your National ID Card (الرقم القومي)</p>
                      </div>
                      <FiChevronRight className="text-gray-400 group-hover:text-red-500" size={18} />
                    </Link>
                    <Link href="/verify?type=foreign" onClick={() => setShowVerifyModal(false)}
                      className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group">
                      <span className="text-3xl">🌍</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-red-700">Foreign Resident / Student</p>
                        <p className="text-xs text-gray-500">Submit passport, student card or residential card</p>
                      </div>
                      <FiChevronRight className="text-gray-400 group-hover:text-red-500" size={18} />
                    </Link>
                  </div>
                  <button onClick={() => setShowVerifyModal(false)}
                    className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await getI18nProps(locale)),
    },
  };
}
