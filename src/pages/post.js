import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCamera, FiAlertCircle, FiCheck, FiChevronDown, FiMapPin, FiShield, FiChevronRight, FiNavigation } from 'react-icons/fi';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { useTranslation } from 'next-i18next';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import { listingsAPI, categoriesAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { categoryConfig, locationHierarchy } from '../lib/categoryConfig';

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function PostListingPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const { edit: editId } = router.query;
  const isArabic = i18n.language === 'ar';

  const conditions = [
    { value: 'New', label: t('post.condition_new'), description: t('post.condition_new_desc') },
    { value: 'Like New', label: t('post.condition_like_new'), description: t('post.condition_like_new_desc') },
    { value: 'Good', label: t('post.condition_good'), description: t('post.condition_good_desc') },
    { value: 'Fair', label: t('post.condition_fair'), description: t('post.condition_fair_desc') },
  ];

  // Step state
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [attributes, setAttributes] = useState({});

  // Location state
  const [locationRegion, setLocationRegion] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationCompound, setLocationCompound] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    condition: '',
  });
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(''); // 'compressing' | 'uploading' | ''
  const [isLoading, setIsLoading] = useState(!!editId);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Redirect if not authenticated (wait for hydration first)
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/?login=true');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await categoriesAPI.getAll();
        if (catRes.data.success) setCategories(catRes.data.categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to categoryConfig keys
        setCategories(Object.keys(categoryConfig).map(name => ({ name, subcategories: [] })));
      }
    };
    fetchCategories();
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
            });
            setExistingImages(listing.images || []);

            // Restore category/subcategory selection
            setSelectedCategory(listing.category || '');
            setSelectedSubcategory(listing.subcategory || '');
            setAttributes(listing.attributes || {});

            // Restore location - map from stored data back to 3-level hierarchy
            const storedArea = listing.location?.area || '';
            const storedCity = listing.location?.city || '';

            // Try to find region from stored city
            const matchedRegion = locationHierarchy.find(r => r.en === storedCity);
            if (matchedRegion) {
              setLocationRegion(storedCity);
              // Try to find city from stored area
              const matchedCity = matchedRegion.cities.find(c => c.en === storedArea);
              if (matchedCity) {
                setLocationCity(storedArea);
              } else {
                // storedArea might be a compound - check all cities
                for (const city of matchedRegion.cities) {
                  if (city.compounds.includes(storedArea)) {
                    setLocationCity(city.en);
                    setLocationCompound(storedArea);
                    break;
                  }
                }
              }
            } else {
              // Try to find city by searching all regions
              for (const region of locationHierarchy) {
                const matchedC = region.cities.find(c => c.en === storedArea);
                if (matchedC) {
                  setLocationRegion(region.en);
                  setLocationCity(storedArea);
                  break;
                }
                // Check compounds
                for (const city of region.cities) {
                  if (city.compounds.includes(storedArea)) {
                    setLocationRegion(region.en);
                    setLocationCity(city.en);
                    setLocationCompound(storedArea);
                    break;
                  }
                }
              }
            }

            // Jump directly to step 3 when editing
            setStep(3);
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
  }, [editId, isAuthenticated, user, router, t]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    rejectedFiles.forEach(({ file, errors: fileErrors }) => {
      fileErrors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} ${t('post.image_too_large')}`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} ${t('post.invalid_image_type')}`);
        }
      });
    });

    const totalImages = images.length + existingImages.length + acceptedFiles.length;
    if (totalImages > MAX_IMAGES) {
      toast.error(`${MAX_IMAGES} ${t('post.max_images')}`);
      return;
    }

    const newImages = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
  }, [images.length, existingImages.length, t]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAttributeChange = (key, value) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat.name);
    setFormData(prev => ({ ...prev, category: cat.name, subcategory: '' }));
    setSelectedSubcategory('');
    setAttributes({});
    if (cat.subcategories && cat.subcategories.length > 0) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleSubcategorySelect = (subName) => {
    setSelectedSubcategory(subName);
    setFormData(prev => ({ ...prev, subcategory: subName }));
    setStep(3);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
            { headers: { 'User-Agent': 'MySouqify/1.0' } }
          );
          const data = await res.json();
          const addr = data.address || {};
          // Build a readable label
          const label = [addr.suburb, addr.city_district, addr.city, addr.state].filter(Boolean).join(', ');
          setDetectedLocation(label || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

          // Try to auto-match to locationHierarchy
          const cityName = (addr.suburb || addr.city_district || addr.city || '').toLowerCase();
          for (const region of locationHierarchy) {
            for (const city of region.cities) {
              if (cityName.includes(city.en.toLowerCase()) || city.en.toLowerCase().includes(cityName)) {
                setLocationRegion(region.en);
                setLocationCity(city.en);
                setLocationCompound('');
                break;
              }
            }
          }
        } catch {
          toast.error('Could not detect location. Please select manually.');
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        toast.error('Location access denied. Please select manually.');
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
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

    if (!locationCity) {
      newErrors['location.city'] = t('post.validation_location_required');
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
      setSubmitStep('compressing');
      const compressionOptions = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg',
      };
      const compressedImages = await Promise.all(
        images.map(async ({ file }) => {
          try {
            const compressed = await imageCompression(file, compressionOptions);
            return compressed;
          } catch {
            return file;
          }
        })
      );

      setSubmitStep('uploading');
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('subcategory', formData.subcategory || '');
      data.append('condition', formData.condition);
      data.append('location', JSON.stringify({
        area: locationCompound || locationCity || 'Other',
        city: locationRegion || 'Cairo'
      }));
      data.append('attributes', JSON.stringify(attributes));

      // Add existing images that weren't removed
      existingImages.forEach((img) => {
        data.append('existingImages', img);
      });

      // Add compressed images
      compressedImages.forEach((file) => {
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

      if (error.response?.data?.requiresVerification) {
        router.push('/verify');
        return;
      }

      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(err => {
          toast.error(err.message || err.msg);
        });
      } else {
        toast.error(error.response?.data?.message || t('post.failed_to_save'));
      }
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  if (!_hasHydrated || !isAuthenticated) {
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

  // Current category's fields from config
  const currentCategoryFields = categoryConfig[selectedCategory]?.fields || [];

  return (
    <Layout>
      <Head>
        <title>{editId ? t('post.edit_title') : t('post.title')} - MySouqify</title>
      </Head>

      {/* Full-screen submission overlay */}
      {isSubmitting && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', borderRadius: 20, padding: '40px 48px', textAlign: 'center', maxWidth: 320, width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 64, height: 64, border: '5px solid #fee2e2', borderTopColor: '#dc2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              {submitStep === 'compressing' ? 'Optimizing Images...' : 'Posting Your Ad...'}
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280' }}>
              {submitStep === 'compressing' ? 'Compressing images for faster upload' : 'Please wait, do not close this page'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes bounce { 0%,80%,100% { transform: scale(0.6); opacity:0.4; } 40% { transform: scale(1); opacity:1; } }
          `}</style>
        </div>
      )}

      <div className="container-app py-6 lg:py-10">

        {/* ── STEP 1: Category Selection ── */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-2">{t('post.title')}</h1>
            <p className="text-gray-500 mb-6">{t('post.select_category')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(categories.length > 0 ? categories : Object.keys(categoryConfig).map(name => ({ name, subcategories: [] }))).map(cat => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat)}
                  className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-red-500 hover:shadow-sm transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{categoryConfig[cat.name]?.icon || '📦'}</span>
                  </div>
                  <span className="flex-1 font-medium text-gray-900">{cat.name}</span>
                  <FiChevronRight className="text-gray-400 group-hover:text-red-500" size={20} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Subcategory Selection ── */}
        {step === 2 && (
          <div className="max-w-4xl mx-auto py-8">
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 hover:text-red-600">
                ← Back
              </button>
              <span>›</span>
              <span className="text-gray-400">{selectedCategory}</span>
            </div>

            <h1 className="text-2xl font-bold mb-2">Choose a Subcategory</h1>
            <p className="text-gray-500 mb-6">Select the most relevant subcategory</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.find(c => c.name === selectedCategory)?.subcategories?.map(sub => {
                const subName = typeof sub === 'string' ? sub : sub.name;
                return (
                  <button
                    key={subName}
                    onClick={() => handleSubcategorySelect(subName)}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-red-500 hover:shadow-sm transition-all text-left group"
                  >
                    <span className="flex-1 font-medium text-gray-900">{subName}</span>
                    <FiChevronRight className="text-gray-400 group-hover:text-red-500" size={20} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Post Details Form ── */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            {/* Step indicator */}
            {step > 1 && (
              <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 hover:text-red-600">
                  ← Back
                </button>
                <span>›</span>
                <span className="text-gray-400">{selectedCategory}</span>
                {selectedSubcategory && (
                  <>
                    <span>›</span>
                    <span className="text-gray-400">{selectedSubcategory}</span>
                  </>
                )}
              </div>
            )}

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              {editId ? t('post.edit_title') : t('post.title')}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Category-specific attribute fields */}
              {currentCategoryFields.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                    {selectedCategory} Details
                  </h3>
                  {currentCategoryFields.map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {isArabic ? field.labelAr : field.label}
                      </label>
                      {field.type === 'select' ? (
                        <div className="relative">
                          <select
                            value={attributes[field.key] || ''}
                            onChange={e => handleAttributeChange(field.key, e.target.value)}
                            className="input w-full appearance-none pr-10"
                          >
                            <option value="">Select {field.label}</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={attributes[field.key] || ''}
                          onChange={e => handleAttributeChange(field.key, e.target.value)}
                          placeholder={field.placeholder || ''}
                          className="input w-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

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

              {/* Location - 3 levels */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('post.location_label')} <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={gpsLoading}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                  >
                    {gpsLoading ? (
                      <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiNavigation size={13} />
                    )}
                    Use Current Location
                  </button>
                </div>

                {/* Detected location label */}
                {detectedLocation && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                    <FiMapPin size={13} className="flex-shrink-0" />
                    <span className="font-medium">Detected:</span>
                    <span>{detectedLocation}</span>
                  </div>
                )}

                {/* Region */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Region</label>
                  <div className="relative">
                    <select
                      value={locationRegion}
                      onChange={(e) => {
                        setLocationRegion(e.target.value);
                        setLocationCity('');
                        setLocationCompound('');
                      }}
                      className={`input w-full appearance-none pr-10 ${errors['location.city'] ? 'border-red-300' : ''}`}
                    >
                      <option value="">Select Region</option>
                      {locationHierarchy.map(r => (
                        <option key={r.en} value={r.en}>{isArabic ? r.ar : r.en}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* City / Area */}
                {locationRegion && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">City / Area</label>
                    <div className="relative">
                      <select
                        value={locationCity}
                        onChange={(e) => {
                          setLocationCity(e.target.value);
                          setLocationCompound('');
                        }}
                        className="input w-full appearance-none pr-10"
                      >
                        <option value="">Select City</option>
                        {locationHierarchy.find(r => r.en === locationRegion)?.cities.map(c => (
                          <option key={c.en} value={c.en}>{isArabic ? c.ar : c.en}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                )}

                {/* Compound / Neighborhood */}
                {locationCity && locationHierarchy.find(r => r.en === locationRegion)?.cities.find(c => c.en === locationCity)?.compounds.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Compound / Neighborhood</label>
                    <div className="relative">
                      <select
                        value={locationCompound}
                        onChange={(e) => setLocationCompound(e.target.value)}
                        className="input w-full appearance-none pr-10"
                      >
                        <option value="">Select Compound (optional)</option>
                        {locationHierarchy.find(r => r.en === locationRegion)?.cities.find(c => c.en === locationCity)?.compounds.map(comp => (
                          <option key={comp} value={comp}>{comp}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                )}

                {errors['location.city'] && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <FiAlertCircle size={14} />
                    {errors['location.city']}
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
        )}
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
