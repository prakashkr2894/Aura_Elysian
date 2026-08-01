import React, { useState, useCallback, memo } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Youtube,
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Logo } from "./Logo";

const Footer: React.FC = memo(() => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubscribe = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      setIsSubmitting(true);
      setSubscriptionStatus({ type: null, message: "" });

      // Mock subscription success since Brevo integration is removed
      setTimeout(() => {
        setSubscriptionStatus({
          type: "success",
          message: "Thank you for subscribing to our newsletter!",
        });
        setEmail(""); // Clear the input on success
        setIsSubmitting(false);

        setTimeout(() => {
          setSubscriptionStatus({ type: null, message: "" });
        }, 5000);
      }, 800);
    },
    [email],
  );

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 mt-auto">
      {/* Newsletter Signup */}
      <section className="py-8 bg-gradient-to-r from-pink-50 via-purple-50 to-amber-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/20 via-purple-100/20 to-amber-100/20"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-amber-400"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between gap-6"
          >
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <Star className="h-5 w-5 text-pink-500" />
                <h2 className="font-serif text-2xl lg:text-3xl font-bold text-gray-900">
                  Stay in the Loop
                </h2>
                <Star className="h-5 w-5 text-pink-500" />
              </div>
              <p className="text-base text-gray-600 max-w-md">
                Get special offers and new product launches delivered to your
                inbox.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full lg:w-auto">
              <div className="flex flex-col gap-3 max-w-md lg:max-w-none">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300 text-sm placeholder-gray-400 transition-all duration-200"
                  />
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </motion.button>
                </div>

                {/* Status Message */}
                {subscriptionStatus.type && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                      subscriptionStatus.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {subscriptionStatus.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span>{subscriptionStatus.message}</span>
                  </motion.div>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Info - Left */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Aura Elysian</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Crafting beautiful, handcrafted candles to illuminate your space
              with elegance and serenity.
            </p>

            {/* Contact Info with Logo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 text-sm">
                  Get in Touch
                </h4>
                <Logo className="h-6 w-6" showText={true} />
              </div>

              {/* Social Media Icons */}
              <div className="flex gap-2 mb-3">
                {[
                  {
                    href: "https://www.instagram.com/auraelysian_1/?hl=en",
                    icon: Instagram,
                    label: "Instagram",
                  },
                  {
                    href: "https://www.youtube.com/channel/UC55z6Gz-o0lqTsX2QVQEdTA",
                    icon: Youtube,
                    label: "YouTube",
                  },
                ].map(({ href, icon: Icon, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={label}
                  >
                    <Icon className="h-6 w-6" />
                  </motion.a>
                ))}
              </div>

              <div className="space-y-2">
                <motion.a
                  href="mailto:info@auraelysian.com"
                  className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors duration-200 group"
                  whileHover={{ x: 3 }}
                >
                  <div className="p-1.5 bg-pink-50 rounded group-hover:bg-pink-100 transition-colors">
                    <Mail className="h-3 w-3" />
                  </div>
                  <span className="text-xs">info@auraelysian.com</span>
                </motion.a>
                <motion.a
                  href="tel:+1234567890"
                  className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors duration-200 group"
                  whileHover={{ x: 3 }}
                >
                  <div className="p-1.5 bg-pink-50 rounded group-hover:bg-pink-100 transition-colors">
                    <Phone className="h-3 w-3" />
                  </div>
                  <span className="text-xs">+91 9934202241</span>
                </motion.a>
                <motion.a
                  href="#"
                  className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors duration-200 group"
                  whileHover={{ x: 3 }}
                >
                  <div className="p-1.5 bg-pink-50 rounded group-hover:bg-pink-100 transition-colors">
                    <MapPin className="h-3 w-3" />
                  </div>
                  <span className="text-xs">
                    Om vihar phase 1, Uttam nagar west, New Delhi
                  </span>
                </motion.a>
              </div>
            </div>
          </div>

          {/* Legal - Right */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-2">
                Legal
              </h4>
              <div className="space-y-1">
                {[
                  { href: "/legal", label: "Privacy Policy" },
                  { href: "/legal", label: "Terms of Service" },
                  { href: "/legal", label: "Return Policy" },
                  { href: "/legal", label: "Contact Us" },
                ].map((link, index) => (
                  <motion.a
                    key={`${link.href}-${index}`}
                    href={link.href}
                    className="text-gray-600 hover:text-pink-600 transition-colors duration-200 text-xs hover:underline block"
                    whileHover={{ x: 3 }}
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-xs text-gray-600">
              © {currentYear} Aura Elysian. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-pink-500" />
              <span>in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export { Footer };
