import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Sparkles, Gift, Star, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useImagePreload } from '../hooks/useImagePreload';

interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  primaryImage: string;
  category: string;
  rating: number;
  reviews: number;
}

interface Testimonial {
  _id: string;
  name: string;
  text: string;
  rating: number;
  image: string;
}

interface FeaturedCollection {
  _id: string;
  name?: string;
  title: string;
  description: string;
  image: string;
  images?: string[]; // Array of image paths
  link: string;
  color: string;
  type: string;
}

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<FeaturedCollection[]>([]);
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: number }>({});

  const featuredProductImages = featuredProducts.map(product => product.primaryImage);
  useImagePreload(featuredProductImages, featuredProducts.length > 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await axios.get('/api/trending-products');
        setFeaturedProducts(productsRes.data.map((p: { _id: string; productId?: string } & Product) => ({
          ...p,
          id: p.productId || p._id // Use productId if available, otherwise use _id
        })));

        const testimonialsRes = await axios.get('/api/testimonials');
        setTestimonials(testimonialsRes.data);

        const collectionsRes = await axios.get('/api/featured-collections');
        setFeaturedCollections(collectionsRes.data);
      } catch (error) {
      }
    };

    fetchData();
  }, []);

  const handleCartUpdate = useCallback((productId: string, quantity: number) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  }, []);

  const getGridClasses = (productCount: number) => {
    if (productCount === 1) {
      return "grid grid-cols-1 gap-4 sm:gap-8 max-w-2xl mx-auto";
    } else {
      return "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto";
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const FeaturedCollectionCard: React.FC<{ collection: FeaturedCollection }> = ({ collection }) => {
    const navigate = useNavigate();

    const images = collection.images && collection.images.length > 0
      ? collection.images
      : [collection.image, collection.image, collection.image, collection.image]; // Fallback to single image repeated

    const navigateToCollection = () => {
      navigate(`${collection.link}?collection=${encodeURIComponent(collection.title)}`);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
        onClick={navigateToCollection}
      >
        {/* Image Grid Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* 2x2 Grid of Images */}
          <div className="grid grid-cols-2 gap-2 h-full p-2">
            {images.slice(0, 4).map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-lg group-hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={image}
                  alt={`${collection.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Subtle overlay for better text readability */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>

          {/* Gradient Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -2 }}
            >
              <h4 className="font-serif text-xl font-semibold mb-3 drop-shadow-lg">
                {collection.name || collection.title}
              </h4>
              <motion.div
                className={`inline-flex items-center gap-2 bg-gradient-to-r ${collection.color} px-6 py-3 rounded-full text-sm font-medium shadow-lg transition-all duration-300 transform group-hover:scale-105`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Collection
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200/30 rounded-full blur-xl" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-amber-200/30 rounded-full blur-xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 text-sm text-pink-600 font-medium mb-8 shadow-lg border border-pink-100"
            >
              <Sparkles className="h-4 w-4 text-pink-500" />
              Transform your space with elegance
              <Sparkles className="h-4 w-4 text-pink-500" />
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight"
            >
              Luxury <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">Candles</span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-600 font-light">for Every Moment</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              Discover our collection of exquisite, hand-poured candles—where elegant design meets captivating fragrance to create your perfect ambiance.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-5 rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg"
              >
                Shop Collection
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/custom"
                className="group inline-flex items-center justify-center gap-3 bg-white/90 backdrop-blur-sm text-gray-900 px-10 py-5 rounded-full font-semibold border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                <Gift className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Custom Orders
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={fadeInUp}
              className="mt-16 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>4.9/5 Customer Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-pink-500" />
                <span>Free Shipping on Orders ₹400+</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Handcrafted with Love</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 font-semibold">COD Available</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-8"
          >
            {/* COD Available */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => {
                alert('COD Available\n\n• Pay when you receive your order\n• No advance payment required\n• Cash on delivery accepted\n• Secure and convenient payment method');
              }}
            >
              <div className="flex items-center gap-3 bg-green-50 hover:bg-green-100 px-4 py-3 rounded-full transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-xl">💳</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-sm">COD Available</h3>
                  <p className="text-xs text-gray-600">Pay on delivery</p>
                </div>
              </div>
            </motion.div>

            {/* Free Shipping */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => {
                alert('Free Shipping\n\n• Free delivery on orders above ₹400\n• No hidden charges\n• Pan India shipping\n• Express delivery available');
              }}
            >
              <div className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-full transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-sm">Free Shipping</h3>
                  <p className="text-xs text-gray-600">Above ₹400</p>
                </div>
              </div>
            </motion.div>

            {/* Fast Delivery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => {
                alert('Fast Delivery\n\n• 5-7 business days delivery\n• Express shipping available\n• Real-time tracking\n• Safe and secure packaging');
              }}
            >
              <div className="flex items-center gap-3 bg-purple-50 hover:bg-purple-100 px-4 py-3 rounded-full transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <span className="text-xl">🚚</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-sm">Fast Delivery</h3>
                  <p className="text-xs text-gray-600">5-7 days</p>
                </div>
              </div>
            </motion.div>

            {/* Premium Quality */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => {
                alert('Premium Quality\n\n• Made in India with love\n• Premium ingredients only\n• Cruelty-free and vegan\n• Handcrafted with care\n• Eco-friendly materials');
              }}
            >
              <div className="flex items-center gap-3 bg-amber-50 hover:bg-amber-100 px-4 py-3 rounded-full transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 text-sm">Premium Quality</h3>
                  <p className="text-xs text-gray-600">Made in India</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Curated Collections
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Featured <span className="bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">Collections</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our carefully curated collections of premium candles, and bespoke custom pieces designed to elevate your space.
            </p>
          </motion.div>

          {/* Enhanced Grid Layout */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {shuffleArray(featuredCollections).map((collection, index) => (
              <motion.div
                key={collection._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeaturedCollectionCard collection={collection} />
              </motion.div>
            ))}
          </motion.div>

          {/* View All Collections CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold text-lg hover:underline transition-colors"
            >
              View All Collections
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Customer Favorites
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trending <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our most popular items, loved by customers worldwide. Each piece is carefully crafted to bring warmth and elegance to your home.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={getGridClasses(featuredProducts.length)}
          >
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <ProductCard
                  product={product}
                  onLike={() => {}}
                  onCartUpdate={handleCartUpdate}
                  quantity={productQuantities[product.id] || 0}
                />
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-gradient-to-b from-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Customer Reviews
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="bg-gradient-to-r from-yellow-400 to-pink-600 bg-clip-text text-transparent">Customers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join thousands of happy customers who have fallen in love with our products and the warmth they bring to their homes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Quote Icon with Review Content */}
                <div className="flex items-start gap-3 bg-pink-100 rounded-2xl p-4 mb-4 group-hover:bg-pink-200 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 bg-pink-200 rounded-full flex-shrink-0 group-hover:bg-pink-300 transition-colors">
                    <span className="text-lg text-pink-600">"</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-base flex-1">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center justify-center w-8 h-8 bg-pink-200 rounded-full flex-shrink-0 group-hover:bg-pink-300 transition-colors">
                    <span className="text-lg text-pink-600">"</span>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-100"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-base">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-gray-500">Verified Customer</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-pink-600 mb-2">100+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="text-3xl font-bold text-amber-600 mb-2">122+</div>
              <div className="text-gray-600">Candles Sold</div>
            </div>
          </motion.div>
        </div>
      </section>

    </motion.div>
  );
};
