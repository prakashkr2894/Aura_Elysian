import { useEffect, useCallback } from 'react';
import { imageCacheService } from '../services/imageCacheService';

export const useImagePreload = (images: string[], enabled: boolean = true) => {
  const preloadImages = useCallback(async () => {
    if (!enabled || !images.length) return;
    
    try {
      await imageCacheService.preloadImages(images);
    } catch (error) {

    }
  }, [images, enabled]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  return {
    preloadImages,
    isImageLoaded: imageCacheService.isImageLoaded.bind(imageCacheService),
    isImageError: imageCacheService.isImageError.bind(imageCacheService),
  };
};
