/**
 * Utility functions for handling image URLs
 * Supports both Cloudinary URLs (full URLs) and local development URLs
 */

/**
 * Get the full image URL
 * @param {string|null|undefined} image - Image path or URL
 * @returns {string|null} Full image URL or null if no image
 */
export const getImageUrl = (image) => {
  if (!image) return null;
  
  // If it's already a full URL (Cloudinary or other CDN), return as is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // For local development, prepend the backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  return `${backendUrl}${image}`;
};

/**
 * Get optimized Cloudinary image URL with transformations
 * @param {string|null|undefined} image - Image URL
 * @param {object} options - Transformation options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.crop - Crop mode (fill, fit, scale, etc.)
 * @param {string} options.quality - Image quality (auto, auto:good, etc.)
 * @returns {string|null} Optimized image URL or null if no image
 */
export const getOptimizedImageUrl = (image, options = {}) => {
  if (!image) return null;
  
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
  } = options;
  
  // If it's a Cloudinary URL, add transformations
  if (image.includes('cloudinary.com')) {
    const url = new URL(image);
    const pathParts = url.pathname.split('/');
    const versionIndex = pathParts.findIndex(part => part === 'v1' || part === 'v2' || /^v\d+$/.test(part));
    
    if (versionIndex !== -1) {
      // Insert transformations after version
      const transformations = [];
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      transformations.push(`c_${crop}`);
      transformations.push(`q_${quality}`);
      
      pathParts.splice(versionIndex + 1, 0, transformations.join(','));
      url.pathname = pathParts.join('/');
      return url.toString();
    }
  }
  
  // For non-Cloudinary URLs, return as is
  return getImageUrl(image);
};

