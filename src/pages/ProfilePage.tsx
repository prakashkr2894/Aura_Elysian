import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogOut, Mail, User as UserIcon, MapPin, Phone, Package, Edit } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
}

interface User {
  name: string;
  email: string;
  username?: string;
  mobile?: string;
  address?: string;
  image?: string;
}

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempMobile, setTempMobile] = useState('');
  const [tempAddress, setTempAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('aura-token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      }
    };

    fetchUserProfile();

    setOrders([
    ]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('aura-token');
    navigate('/login');
  };

  const handleEditMobile = () => {
    setTempMobile(user?.mobile || '');
    setIsEditingMobile(true);
  };

  const handleSaveMobile = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('aura-token');
    try {
      const response = await fetch(`/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mobile: tempMobile }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditingMobile(false);
      } else {
      }
    } catch (error) {
    }
  };

  const handleCancelMobile = () => {
    setIsEditingMobile(false);
    setTempMobile('');
  };

  const handleEditAddress = () => {
    setTempAddress(user?.address || '');
    setIsEditingAddress(true);
  };

  const handleSaveAddress = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('aura-token');
    try {
      const response = await fetch(`/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ address: tempAddress }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsEditingAddress(false);
      } else {
      }
    } catch (error) {
    }
  };

  const handleCancelAddress = () => {
    setIsEditingAddress(false);
    setTempAddress('');
  };

  const handleSaveImage = async () => {
    if (!imageFile) return;
    const token = localStorage.getItem('token') || localStorage.getItem('aura-token');
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setImageFile(null);
      } else {
      }
    } catch (error) {
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : (user.image ? (() => {
                  return user.image;
                })() : 'https://via.placeholder.com/96x96/cccccc/000000?text=Profile')}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <button
                onClick={() => document.getElementById('profileImageInput')?.click()}
                className="absolute bottom-0 right-0 bg-pink-500 text-white p-1 rounded-full hover:bg-pink-600 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <input
              id="profileImageInput"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              className="hidden"
            />
            {imageFile && (
              <button
                onClick={handleSaveImage}
                className="mt-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                Save Profile Picture
              </button>
            )}
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>

          <div className="space-y-6">

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <UserIcon className="h-6 w-6 text-pink-500 mr-4" />
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">Full Name</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Mail className="h-6 w-6 text-pink-500 mr-4" />
              <div>
                <p className="font-medium text-gray-900">{user.email}</p>
                <p className="text-sm text-gray-500">Email Address</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Phone className="h-6 w-6 text-pink-500 mr-4" />
              <div className="flex-1">
                {isEditingMobile ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={tempMobile}
                      onChange={(e) => setTempMobile(e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveMobile}
                        className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelMobile}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.mobile || 'Enter your phone number'}</p>
                      <p className="text-sm text-gray-500">Mobile Number</p>
                    </div>
                    <button
                      onClick={handleEditMobile}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <MapPin className="h-6 w-6 text-pink-500 mr-4" />
              <div className="flex-1">
                {isEditingAddress ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      placeholder="Enter your address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveAddress}
                        className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelAddress}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.address || 'Enter your address'}</p>
                      <p className="text-sm text-gray-500">Address</p>
                    </div>
                    <button
                      onClick={handleEditAddress}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-6 w-6 text-pink-500 mr-2" />
              Order History
            </h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.items} items</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
