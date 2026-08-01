import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import { imageCacheService } from '../services/imageCacheService';

interface ImageWithLoadingProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  showSuccessPopup?: boolean;
  containerClassName?: string;
  loadingSpinnerClassName?: string;
  successPopupDuration?: number;
  priority?: boolean;
  lazy?: boolean;
}

const ImageWithLoadingComponent: React.FC<ImageWithLoadingProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  onLoad,
  onError,
  showSuccessPopup = false,
  containerClassName = "",
  loadingSpinnerClassName = "",
  successPopupDuration = 2000,
  priority = false,
  lazy = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<number>();
  const spinnerTimeoutRef = useRef<number>();

  useEffect(() => {
    if (imageCacheService.isImageLoaded(src)) {
      setLoading(false);
      setImageLoaded(true);
      setError(false);
      setShowSuccess(false);
      return;
    }

    if (imageCacheService.isImageError(src)) {
      setLoading(false);
      setError(true);
      setImageLoaded(false);
      setShowSuccess(false);
      return;
    }

    setLoading(true);
    setShowSpinner(false);
    setError(false);
    setImageLoaded(false);
    setShowSuccess(false);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (spinnerTimeoutRef.current) {
      clearTimeout(spinnerTimeoutRef.current);
    }

    spinnerTimeoutRef.current = setTimeout(() => {
      setShowSpinner(true);
    }, 100);
  }, [src]);

  const handleImageLoad = useCallback(() => {
    setLoading(false);
    setShowSpinner(false);
    setImageLoaded(true);
    setError(false);

    if (spinnerTimeoutRef.current) {
      clearTimeout(spinnerTimeoutRef.current);
    }

    if (showSuccessPopup) {
      setShowSuccess(true);
      timeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
      }, successPopupDuration);
    }
    
    onLoad?.();
  }, [showSuccessPopup, successPopupDuration, onLoad]);

  const handleImageError = useCallback(() => {
    setLoading(false);
    setShowSpinner(false);
    setError(true);
    setImageLoaded(false);

    if (spinnerTimeoutRef.current) {
      clearTimeout(spinnerTimeoutRef.current);
    }

    onError?.();
  }, [onError]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (spinnerTimeoutRef.current) {
        clearTimeout(spinnerTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Loading Spinner */}
      <AnimatePresence>
        {loading && showSpinner && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10"
          >
            <div className={`w-8 h-8 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin ${loadingSpinnerClassName}`}></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500 z-10"
          >
            <X className="w-8 h-8 mb-2" />
            <span className="text-sm">Failed to load image</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual Image */}
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        loading={priority ? "eager" : (lazy ? "lazy" : "eager")}
        decoding="async"
        fetchpriority={priority ? "high" : "auto"}
      />

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 z-20"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Image loaded!</span>
            <button
              onClick={handleSuccessClose}
              className="ml-1 hover:bg-green-600 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ImageWithLoading = memo(ImageWithLoadingComponent);
