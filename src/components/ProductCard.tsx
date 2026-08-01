import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageWithLoading } from './ImageWithLoading';
import { imageCacheService } from '../services/imageCacheService';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  primaryImage: string;
  category: string;
  rating: number;
  reviews: number;
  isLiked?: boolean;
  fragrance?: string;
  weight?: string;
}

interface ProductCardProps {
  product: Product;
  onLike?: (productId: string) => void;
  onCartUpdate: (productId: string, quantity: number) => void;
  quantity: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onLike,
  onCartUpdate,
  quantity,
}) => {
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const [isInView, setIsInView] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentQuantity(quantity);
  }, [quantity]);

  useEffect(() => {
    if (imageCacheService.isImageLoaded(product.primaryImage)) {
      setImageLoaded(true);
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          imageCacheService.preloadImage(product.primaryImage).then(() => {
            setImageLoaded(true);
          }).catch(() => {
            setImageLoaded(false);
          });
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [product.primaryImage]);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuantityChange = (newQuantity: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    newQuantity = Math.max(0, newQuantity);
    setCurrentQuantity(newQuantity);
    onCartUpdate(product.id, newQuantity);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(product.id);
  };

  return (
    <Link to={`/candles/${product.id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {discount}% OFF
          </div>
        )}

        {/* Like Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLikeClick}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
            product.isLiked
              ? 'bg-pink-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-pink-50 hover:text-pink-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${product.isLiked ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {!isInView ? (
            <div ref={imgRef} className="w-full h-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <ImageWithLoading
              src={product.primaryImage || ''}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              showSuccessPopup={false}
              containerClassName="w-full h-full"
              priority={false}
              lazy={false}
            />
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {product.category}
            </p>
            <h3 className="font-serif text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors duration-200">
              {product.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              {product.fragrance && <span>{product.fragrance}</span>}
              {product.fragrance && product.weight && <span className="mx-2">·</span>}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviews})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {currentQuantity > 0 ? (
              <div className="flex items-center justify-center rounded-full bg-pink-100 text-pink-700 font-bold text-xs overflow-hidden">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(currentQuantity - 1); }}
                  className="p-2 hover:bg-pink-200 transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="px-2">{currentQuantity}</span>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(currentQuantity + 1); }}
                  className="p-2 hover:bg-pink-200 transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleQuantityChange(1);
                }}
                className="bg-pink-100 text-pink-700 hover:bg-pink-200 text-xs font-bold px-3 py-2 rounded-full transition-colors"
              >
                Add to Cart
              </motion.button>
            )}
          </div>
          {currentQuantity > 0 && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/cart'); }}
              className="w-full bg-pink-600 text-white text-sm font-bold py-2 rounded-lg hover:bg-pink-700 transition-colors mt-2"
            >
              Go to Cart
            </button>
          )}
        </div>
      </motion.div>
    </Link>
  );
};
