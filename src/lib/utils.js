/**
 * Get proper image URL from an image object or string.
 * Handles: { url: '/uploads/xxx.jpg' }, '/uploads/xxx.jpg', 'data:...', 'http://...'
 */
export function getImageUrl(image) {
  if (!image) return '/images/placeholder.jpg';
  const url = typeof image === 'object' ? image?.url : image;
  if (!url) return '/images/placeholder.jpg';
  // data URLs and full URLs can be used directly
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  // Relative URLs like /uploads/xxx.jpg go through Next.js rewrites
  return url;
}
