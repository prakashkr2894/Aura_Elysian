import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import axios from 'axios';

export const CartPage: React.FC = () => {
    const { cart, loading, updateCartItemQuantity, clearCart } = useCart();
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            setMessage('Your cart is empty.');
            return;
        }

        setIsPaymentProcessing(true);
        setMessage('');

        try {
            const { data: razorpayOrder } = await axios.post(
                `/api/razorpay/order`,
                { amount: total },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('aura-token')}` } },
            );

            const options = {
                key: 'rzp_test_Risv0DiB8AgNG0',
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'Aura Elysian',
                description: 'Purchase from Aura Elysian',
                order_id: razorpayOrder.id,
                handler: async function (response: any) {
                    try {
                        await axios.post(
                            `/api/orders`,
                            {
                                products: cart.map(item => ({
                                    productId: item.productId,
                                    name: item.name,
                                    price: item.price,
                                    quantity: item.quantity,
                                })),
                                totalAmount: total,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                paymentStatus: 'paid',
                            },
                            { headers: { Authorization: `Bearer ${localStorage.getItem('token') || localStorage.getItem('aura-token')}` } },
                        );
                        setMessage('Payment successful! Your order has been placed.');
                        clearCart();
                    } catch (error) {
                        setMessage('Payment succeeded but failed to save order. Please contact support.');
                    }
                    setIsPaymentProcessing(false);
                },
                prefill: { email: '' },
                theme: { color: '#f472b6' },
                modal: {
                    ondismiss: () => {
                        setIsPaymentProcessing(false);
                        setMessage('Payment cancelled.');
                    },
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error) {
            setMessage('Failed to initiate payment. Please try again.');
            setIsPaymentProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Shopping Cart</h1>

                {message && (
                    <div className={`mb-4 p-4 rounded ${message.toLowerCase().includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message}
                    </div>
                )}

                {loading ? (
                    <p className="text-gray-600">Loading cart...</p>
                ) : cart.length === 0 ? (
                    <p className="text-gray-600">Your cart is empty.</p>
                ) : (
                    <div className="space-y-6">
                        {cart.map((item) => (
                            <motion.div
                                key={item.productId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-lg shadow p-6 flex items-center gap-4"
                            >
                                <img src={item.primaryImage} alt={item.name} className="w-20 h-20 object-cover rounded" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                    <p className="text-pink-600 font-medium">₹{item.price}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                                        className="p-1 text-gray-500 hover:text-gray-700"
                                        disabled={isPaymentProcessing}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                                        className="p-1 text-gray-500 hover:text-gray-700"
                                        disabled={isPaymentProcessing}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => updateCartItemQuantity(item.productId, 0)}
                                    className="p-2 text-red-500 hover:text-red-700"
                                    disabled={isPaymentProcessing}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </motion.div>
                        ))}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold">Total: ₹{total.toFixed(2)}</span>
                                <button
                                    className="bg-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-600 disabled:opacity-50"
                                    onClick={handleCheckout}
                                    disabled={isPaymentProcessing}
                                >
                                    {isPaymentProcessing ? 'Processing...' : 'Checkout'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
