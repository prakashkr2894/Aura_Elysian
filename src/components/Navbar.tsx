import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { getCartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/candles', label: 'Candles' },
    { href: '/custom', label: 'Custom' },
    { href: '/orders', label: 'Order History' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg shadow-gray-100/50'
          : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Enhanced Logo with Animation */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="flex-shrink-0">
              <Logo className="h-10 w-10 lg:h-12 lg:w-12" />
            </Link>
          </motion.div>

          {/* Enhanced Desktop Search */}
          <div className="hidden lg:block flex-1 max-w-2xl mx-8">
            <motion.div
              className="relative"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search candles, scents, collections..."
                className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300 hover:shadow-md focus:shadow-lg focus:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors duration-200"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Enhanced Desktop Menu Links */}
          <div className="hidden lg:flex items-center space-x-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={link.href}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${
                    isActive(link.href)
                      ? 'text-pink-600 bg-pink-50 shadow-sm'
                      : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive(link.href) && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  )}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.05 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/liked"
                className="p-3 text-gray-700 hover:text-pink-600 rounded-full transition-all duration-300"
              >
                <Heart className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/cart"
                className="p-3 text-gray-700 hover:text-pink-600 rounded-full transition-all duration-300"
              >
                <ShoppingBag className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/profile"
                className="p-3 text-gray-700 hover:text-pink-600 rounded-full transition-all duration-300"
              >
                <User className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              </Link>
            </motion.div>
          </div>

          {/* Enhanced Mobile Menu Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-3 text-gray-700 hover:text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-full transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="lg:hidden bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 shadow-lg"
          >
            <div className="px-4 py-6 space-y-6">
              {/* Enhanced Mobile Search */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search candles, scents, collections..."
                  className="w-full pl-10 pr-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all duration-300 hover:shadow-md focus:shadow-lg focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors duration-200"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </motion.div>

              {/* Enhanced Mobile Navigation Links */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 group ${
                        isActive(link.href)
                          ? 'text-pink-600 bg-gradient-to-r from-pink-50 to-purple-50 shadow-sm'
                          : 'text-gray-700 hover:text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {link.label}
                        {isActive(link.href) && (
                          <motion.div
                            className="w-2 h-2 bg-pink-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                          />
                        )}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Enhanced Mobile Actions */}
              <motion.div
                className="flex items-center justify-around pt-6 border-t border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/liked"
                    className="flex flex-col items-center p-3 text-gray-700 hover:text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-xl transition-all duration-300 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <Heart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs mt-1 font-medium">Wishlist</span>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/cart"
                    className="flex flex-col items-center p-3 text-gray-700 hover:text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-xl transition-all duration-300 group relative"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs mt-1 font-medium">Cart</span>
                    <motion.span
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                      animate={{ scale: getCartCount() > 0 ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {getCartCount()}
                    </motion.span>
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/profile"
                    className="flex flex-col items-center p-3 text-gray-700 hover:text-pink-600 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-xl transition-all duration-300 group"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs mt-1 font-medium">Profile</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};