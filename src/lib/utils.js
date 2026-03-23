export const PLACEHOLDER_IMG = '/images/placeholder.jpg';

/**
 * Get proper image URL from an image object or string.
 * Handles: { url: '/uploads/xxx.jpg' }, '/uploads/xxx.jpg', 'data:...', 'http://...'
 */
export function getImageUrl(image) {
  if (!image) return PLACEHOLDER_IMG;
  const url = typeof image === 'object' ? image?.url : image;
  if (!url) return PLACEHOLDER_IMG;
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  return url;
}
