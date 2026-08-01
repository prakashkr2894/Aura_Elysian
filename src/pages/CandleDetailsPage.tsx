import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';

import { useCart } from '../context/CartContext';
import { ImageWithLoading } from '../components/ImageWithLoading';
import { imageCacheService } from '../services/imageCacheService';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  primaryImage: string;
  category: string;
  rating: number;
  reviews: number;
  theme?: string;
  fragrance?: string;
  weight?: string;
  container?: string;
  festival?: string[];
  description?: string;
}

interface Review {
  _id: string;
  name: string;
  text: string;
  rating: number;
  image?: string;
  images?: string[];
  orderId: string;
  productId?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
}

const CandleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cart, updateCartItemQuantity } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [currentMainImage, setCurrentMainImage] = useState<string | null>(null);

  const cartItem = cart.find(item => item.productId === id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;
    updateCartItemQuantity(id!, newQuantity);
  };

  const preloadProductImages = useCallback(async (images: string[]) => {
    await imageCacheService.preloadImages(images);
  }, []);

  const productImages = useMemo(() => {
    if (!product?.images) return [];
    return product.images.filter(Boolean);
  }, [product?.images]);

  const handleBuyNow = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    navigate('/cart');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setReviewImages(prev => {
        const combined = [...prev, ...filesArray];
        return combined.slice(0, 3); // max 3 images
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingReview(true);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('productId', id!);
    formData.append('rating', rating.toString());
    formData.append('text', reviewText);  // Changed from 'review' to 'text' to match backend schema
    reviewImages.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await axios.post(`/api/productreviews`, formData, {
        headers: {

          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      alert('Review submitted successfully!');
      setProduct(prev => {
        if (!prev) return prev;
        const prevReviews = typeof prev.reviews === 'number' ? prev.reviews : 0;
        const prevRating = typeof prev.rating === 'number' ? prev.rating : 0;
        const newReviews = prevReviews + 1;
        const newAvgRating = newReviews > 0 ? ((prevRating * prevReviews) + rating) / newReviews : rating;
        return { ...prev, reviews: newReviews, rating: newAvgRating };
      });
      setReviewText('');
      setReviewImages([]);
      setRating(0);
      const response = await axios.get(`/api/products/${id}/reviews`);
      setReviews(response.data);
      const productRes = await axios.get(`/api/products/${id}`);
      setProduct(productRes.data);

    } catch (error) {
      alert('Failed to submit review');
    } finally {
      setLoadingReview(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${id}`);
        setProduct(response.data);
        setCurrentMainImage(response.data.primaryImage);

        if (response.data.images && response.data.images.length > 0) {
          preloadProductImages(response.data.images);
        }
      } catch (error) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, preloadProductImages]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/products/${id}/reviews`);
        setReviews(response.data);
      } catch (error) {
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Product not found'}</p>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <button
        onClick={() => navigate('/products')}
        className="fixed top-24 left-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition-transform hover:scale-110"
      >

        <ArrowLeft className="h-6 w-6" />
      </button>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="relative aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden bg-gray-100">
                <ImageWithLoading
                  src={currentMainImage || product?.primaryImage || ''}
                  alt={product?.name || 'Product'}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  showSuccessPopup={false}
                  containerClassName="w-full h-full"
                  priority={true}
                  lazy={false}
                />

                {discount > 0 && (
                  <div className="absolute top-4 left-4 z-10 bg-pink-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                    {discount}% OFF
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-4">
                {productImages.map((img, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                      img === currentMainImage ? 'ring-2 ring-pink-500' : 'hover:ring-2 hover:ring-pink-300'
                    }`}
                    onClick={() => setCurrentMainImage(img)}
                  >
                    <ImageWithLoading
                      src={img}
                      alt={`${product?.name} thumbnail ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                      showSuccessPopup={false}
                      containerClassName="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4 sm:p-6 lg:p-12 flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600 uppercase tracking-wider">{product?.category}</p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mt-2 mb-4">{product?.name}</h1>

                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(product?.rating ?? 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="ml-3 text-sm text-gray-600">
                    {(product?.rating ?? 0).toFixed(1)} ({product?.reviews ?? 0} reviews)
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-gray-900">₹{product?.price}</span>
                    {product?.originalPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-green-600 font-semibold">Inclusive of all taxes</p>
                </div>

                {product?.description && (
                  <div className="mb-8">
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Product Specs */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                  {product?.fragrance && <div className="p-3 bg-gray-50 rounded-lg"><span className="font-semibold text-gray-800">Fragrance:</span> <span className="text-gray-600">{product.fragrance}</span></div>}
                  {product?.weight && <div className="p-3 bg-gray-50 rounded-lg"><span className="font-semibold text-gray-800">Weight:</span> <span className="text-gray-600">{product.weight}</span></div>}
                  {product?.container && <div className="p-3 bg-gray-50 rounded-lg"><span className="font-semibold text-gray-800">Container:</span> <span className="text-gray-600">{product.container}</span></div>}
                  {product?.theme && <div className="p-3 bg-gray-50 rounded-lg"><span className="font-semibold text-gray-800">Theme:</span> <span className="text-gray-600">{product.theme}</span></div>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto">
                {cartQuantity > 0 ? (
                  <div className="mb-6">
                    <div className="flex items-center justify-center rounded-full bg-pink-100 text-pink-700 font-bold text-xs overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(cartQuantity - 1)}
                        className="p-2 hover:bg-pink-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4">{cartQuantity}</span>
                      <button
                        onClick={() => handleQuantityChange(cartQuantity + 1)}
                        className="p-2 hover:bg-pink-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-semibold">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg">-</button>
                      <span className="px-4 py-2 font-semibold">{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg">+</button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cartQuantity === 0 && (
                    <button
                      onClick={() => handleQuantityChange(quantity)}
                      className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart
                    </button>
                  )}
                  <button onClick={handleBuyNow} className={`w-full ${cartQuantity > 0 ? 'col-span-2' : ''} bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2`}>
                    <ShoppingCart size={20} />
                    Go to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center text-gray-500">
                <p>No reviews yet.</p>
                <p>Be the first to review this product!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                    {/* Profile Image - 40% larger */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <ImageWithLoading
                          src={`${review.userId?.image || review.image || '/default-profile.png'}`}
                          alt={review.name}
                          className="w-full h-full object-cover"
                          showSuccessPopup={false}
                          containerClassName="w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <div className="text-center mb-2">
                      <p className="font-semibold text-gray-900 text-sm">{review.name}</p>
                    </div>

                    {/* Rating */}
                    <div className="text-center mb-3">
                      <div className="flex justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-2.8 w-2.8 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div className="mb-4">
                      <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                    </div>

                    {/* Review Images */}
                    {(review.images && review.images.length > 0) || review.image ? (
                      <div className="flex justify-center">
                        <div className="flex space-x-2 overflow-x-auto max-w-full">
                          {(review.images && review.images.length > 0 ? review.images : [review.image]).map((imgSrc, idx) => {
                            const finalSrc = imgSrc || '/default-profile.png';
                            return (
                              <div
                                key={idx}
                                className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer flex-shrink-0 bg-gray-100"
                                onClick={() => setZoomedImage(finalSrc)}
                              >
                                <ImageWithLoading
                                  src={finalSrc}
                                  alt={`${review.name} image ${idx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                                  showSuccessPopup={false}
                                  containerClassName="w-full h-full"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}

                {zoomedImage && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 cursor-zoom-out transition-opacity duration-500 ease-in-out"
                    onClick={() => setZoomedImage(null)}
                    style={{ backdropFilter: 'blur(4px)' }}
                  >
                    <img
                      src={`${zoomedImage}`}
                      alt="Zoomed"
                      className="rounded-lg shadow-lg transition-transform duration-500 ease-in-out"

                      style={{ transform: 'scale(0.7)' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Add Review Form */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Add a Review</h3>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">
                    Your Review
                  </label>
                  <textarea
                    id="reviewText"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
                    placeholder="Write your review here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Images (optional, max 3)
                  </label>
                  <div className="flex items-center space-x-4">
                    {reviewImages.map((file, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    {reviewImages.length < 3 && (
                      <label
                        htmlFor="reviewImage"
                        className="flex items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer text-pink-600 text-3xl font-bold select-none"
                      >
                        +
                        <input
                          type="file"
                          id="reviewImage"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
                        aria-label={`${star} star`}
                      >
                        <svg
                          className="h-6 w-6 fill-current"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loadingReview}
                    className="inline-flex justify-center rounded-md border border-transparent bg-pink-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandleDetailsPage;
