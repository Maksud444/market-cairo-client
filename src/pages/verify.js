import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'next-i18next';
import { FiUpload, FiX, FiCheck, FiClock, FiAlertCircle, FiShield, FiFileText } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getI18nProps } from '../lib/i18n';
import Layout from '../components/Layout';
import { verificationAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { withAuth } from '../hoc/withAuth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function VerifyPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { user, fetchUser } = useAuthStore();

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const res = await verificationAPI.getStatus();
      if (res.data.success) {
        const v = res.data.verification;
        setVerificationStatus(v.status || 'unverified');
        if (v.rejectionReason) {
          setRejectionReason(v.rejectionReason);
        }
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Max images depends on document type: passport=1, cards=2 (front+back)
  const maxImages = documentType === 'passport' ? 1 : 2;

  // Clear documents when document type changes
  useEffect(() => {
    documents.forEach(d => URL.revokeObjectURL(d.preview));
    setDocuments([]);
  }, [documentType]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast.error(`${file.name} ${t('verify.file_too_large')}`);
        } else if (error.code === 'file-invalid-type') {
          toast.error(`${file.name} ${t('verify.invalid_file_type')}`);
        }
      });
    });

    const remaining = maxImages - documents.length;
    if (acceptedFiles.length > remaining) {
      toast.error(documentType === 'passport'
        ? t('verify.passport_one_image')
        : t('verify.card_two_images'));
      return;
    }

    const newDocs = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setDocuments(prev => [...prev, ...newDocs]);
  }, [documents.length, maxImages, documentType, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    maxFiles: maxImages - documents.length,
    disabled: !documentType || documents.length >= maxImages,
  });

  const removeDocument = (index) => {
    setDocuments(prev => {
      const newDocs = [...prev];
      URL.revokeObjectURL(newDocs[index].preview);
      newDocs.splice(index, 1);
      return newDocs;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentType) {
      toast.error(t('verify.select_document_type'));
      return;
    }

    const requiredCount = documentType === 'passport' ? 1 : 2;
    if (documents.length !== requiredCount) {
      toast.error(documentType === 'passport'
        ? t('verify.passport_one_image')
        : t('verify.card_two_images'));
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      documents.forEach(({ file }) => {
        formData.append('documents', file);
      });

      const res = await verificationAPI.submit(formData);
      if (res.data.success) {
        toast.success(t('verify.submitted_success'));
        setVerificationStatus('pending');
        setDocuments([]);
        setDocumentType('');
        // Refresh user data
        if (fetchUser) await fetchUser();
      }
    } catch (error) {
      console.error('Submit verification error:', error);
      toast.error(error.response?.data?.message || t('verify.submit_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const documentTypes = [
    { value: 'passport', label: t('verify.passport'), icon: '🛂', desc: t('verify.passport_desc') },
    { value: 'student_card', label: t('verify.student_card'), icon: '🎓', desc: t('verify.student_card_desc') },
    { value: 'residential_card', label: t('verify.residential_card'), icon: '🏠', desc: t('verify.residential_card_desc') },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="container-app py-8 max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Already approved - redirect to post
  if (verificationStatus === 'approved') {
    return (
      <Layout>
        <Head>
          <title>{t('verify.title')} - MySouqify</title>
        </Head>
        <div className="container-app py-8 max-w-2xl">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-green-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">{t('verify.already_verified')}</h2>
            <p className="text-green-600 mb-6">{t('verify.already_verified_desc')}</p>
            <Link href="/post" className="btn btn-primary">
              {t('verify.go_post')}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Pending review
  if (verificationStatus === 'pending') {
    return (
      <Layout>
        <Head>
          <title>{t('verify.title')} - MySouqify</title>
        </Head>
        <div className="container-app py-8 max-w-2xl">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiClock className="text-yellow-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-yellow-800 mb-2">{t('verify.pending_title')}</h2>
            <p className="text-yellow-600 mb-6">{t('verify.pending_desc')}</p>
            <Link href="/dashboard" className="btn btn-outline">
              {t('verify.back_to_dashboard')}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Unverified or rejected - show form
  return (
    <Layout>
      <Head>
        <title>{t('verify.title')} - MySouqify</title>
      </Head>

      <div className="container-app py-6 lg:py-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="text-primary-600" size={32} />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{t('verify.title')}</h1>
            <p className="text-gray-600">{t('verify.subtitle')}</p>
          </div>

          {/* Rejection banner */}
          {verificationStatus === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-red-800">{t('verify.rejected_title')}</h3>
                  <p className="text-red-600 text-sm mt-1">{rejectionReason}</p>
                  <p className="text-red-500 text-sm mt-2">{t('verify.rejected_resubmit')}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('verify.select_document_type')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {documentTypes.map((doc) => (
                  <label
                    key={doc.value}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      documentType === doc.value
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="documentType"
                      value={doc.value}
                      checked={documentType === doc.value}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-3xl">{doc.icon}</span>
                    <span className="font-medium text-gray-900 text-sm">{doc.label}</span>
                    <span className="text-xs text-gray-500 text-center">{doc.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Document Upload */}
            {documentType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('verify.upload_documents')} <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal ml-1">
                    ({documents.length}/{maxImages})
                  </span>
                </label>

                {/* Upload hint */}
                <p className="text-sm text-gray-500 mb-3">
                  {documentType === 'passport'
                    ? t('verify.passport_upload_hint')
                    : t('verify.card_upload_hint')}
                </p>

                {documentType === 'passport' ? (
                  /* Passport: single upload */
                  <div>
                    {documents.length === 0 ? (
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                            isDragActive ? 'bg-primary-100' : 'bg-gray-100'
                          }`}>
                            <FiUpload className={isDragActive ? 'text-primary-600' : 'text-gray-400'} size={24} />
                          </div>
                          <p className="text-gray-600 mb-1">
                            {isDragActive ? t('verify.drop_here') : t('verify.drag_drop')}
                          </p>
                          <p className="text-xs text-gray-400">{t('verify.upload_format')}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group inline-block">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 relative border border-gray-200">
                          <Image src={documents[0].preview} alt="" fill className="object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(0)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Student Card / Residential Card: front + back */
                  <div className="grid grid-cols-2 gap-4">
                    {/* Front Side */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">{t('verify.front_side')}</p>
                      {documents.length < 1 ? (
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors aspect-[3/2] flex items-center justify-center ${
                            isDragActive
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          <input {...getInputProps()} />
                          <div className="flex flex-col items-center">
                            <FiUpload className="text-gray-400 mb-2" size={20} />
                            <p className="text-xs text-gray-500">{t('verify.upload_front')}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <div className="aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 relative border border-gray-200">
                            <Image src={documents[0].preview} alt="Front" fill className="object-cover" />
                          </div>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
                            {t('verify.front_side')}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDocument(0)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Back Side */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">{t('verify.back_side')}</p>
                      {documents.length < 2 ? (
                        <div
                          {...(documents.length === 1 ? getRootProps() : {})}
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors aspect-[3/2] flex items-center justify-center ${
                            documents.length === 1
                              ? 'cursor-pointer hover:border-primary-400 border-gray-300'
                              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }`}
                        >
                          {documents.length === 1 && <input {...getInputProps()} />}
                          <div className="flex flex-col items-center">
                            <FiUpload className={documents.length === 1 ? 'text-gray-400 mb-2' : 'text-gray-300 mb-2'} size={20} />
                            <p className={`text-xs ${documents.length === 1 ? 'text-gray-500' : 'text-gray-400'}`}>
                              {documents.length === 1 ? t('verify.upload_back') : t('verify.upload_front_first')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <div className="aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 relative border border-gray-200">
                            <Image src={documents[1].preview} alt="Back" fill className="object-cover" />
                          </div>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
                            {t('verify.back_side')}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeDocument(1)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FiFileText className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">{t('verify.info_title')}</p>
                  <ul className="space-y-1 text-blue-600">
                    <li>{t('verify.info_1')}</li>
                    <li>{t('verify.info_2')}</li>
                    <li>{t('verify.info_3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !documentType || documents.length !== (documentType === 'passport' ? 1 : 2)}
              className="btn btn-primary w-full py-3 disabled:opacity-50"
            >
              {isSubmitting ? t('verify.submitting') : t('verify.submit_button')}
            </button>
          </form>
        </div>
      </div>
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

export default withAuth(VerifyPage);
