import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fadeInUp = {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Login failed');
            }

            const { token } = await response.json();
            localStorage.setItem('token', token);
            const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectTo);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Please sign in to your account.</p>
                    </div>

                    <motion.form
                        onSubmit={handleSubmit}
                        variants={{
                            initial: { transition: { staggerChildren: 0.1 } },
                            animate: { transition: { staggerChildren: 0.1 } },
                        }}
                        initial="initial"
                        animate="animate"
                        className="space-y-6"
                    >
                        <motion.div variants={fadeInUp} className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail className="h-5 w-5" />
                            </span>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
                            />
                        </motion.div>

                        <motion.div variants={fadeInUp} className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock className="h-5 w-5" />
                            </span>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
                            />
                        </motion.div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <motion.div variants={fadeInUp} className="text-right">
                            <Link to="/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
                                Forgot Password?
                            </Link>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <LogIn className="h-5 w-5" />
                                Sign In
                            </button>
                        </motion.div>
                    </motion.form>

                    <motion.div variants={fadeInUp} className="text-center mt-8">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                                Sign Up
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
