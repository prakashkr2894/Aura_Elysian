import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CustomOrderPage: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [referenceLink, setReferenceLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem('customOrderData');
    if (storedData) {
      const { description, referenceLink } = JSON.parse(storedData);
      setDescription(description || '');
      setReferenceLink(referenceLink || '');
      localStorage.removeItem('customOrderData');
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token') || localStorage.getItem('aura-token');
    if (!token) {
      const formData = {
        description,
        referenceLink,
      };
      localStorage.setItem('customOrderData', JSON.stringify(formData));
      localStorage.setItem('redirectAfterLogin', '/custom');
      navigate('/login');
      return;
    }

    const formData = new FormData();
    if (image) formData.append('image', image);
    if (description) formData.append('description', description);
    if (referenceLink) formData.append('referenceLink', referenceLink);

    try {
      const response = await axios.post(`/api/custom-orders`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      setMessage('Custom order submitted successfully! We promise lower prices than others.');
      setImage(null);
      setDescription('');
      setReferenceLink('');
    } catch (error) {
      setMessage('Failed to submit custom order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-pink-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-pink-600 mb-4">Custom Order</h1>
          <p className="text-gray-600 text-lg">
            Submit your custom order details. We promise lower prices than others!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="image" className="block text-sm font-semibold text-pink-700">
              Upload Image (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-pink-300 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors"
              >
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-pink-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm text-pink-600">
                    {image ? image.name : 'Click to upload an image'}
                  </p>
                </div>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-pink-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
              placeholder="Describe your custom order..."
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="referenceLink" className="block text-sm font-semibold text-pink-700">
              Reference Link (Optional)
            </label>
            <input
              type="url"
              id="referenceLink"
              value={referenceLink}
              onChange={(e) => setReferenceLink(e.target.value)}
              className="w-full px-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="https://example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Custom Order'
            )}
          </button>
        </form>
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            <p className="text-center font-medium">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomOrderPage;
