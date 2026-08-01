import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Trash2 } from 'lucide-react';

interface FeaturedCollection {
  _id: string;
  name?: string;
  title: string;
  description: string;
  image: string;
  link: string;
  color: string;
  type: string;
}

interface FeaturedCollectionsFormProps {
  onSuccess?: () => void;
}

export const FeaturedCollectionsForm: React.FC<FeaturedCollectionsFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState<FeaturedCollection[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages].slice(0, 4)); // Max 4 images
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await axios.get('/api/featured-collections');
      setCollections(response.data);
    } catch (error) {
    }
  };

  const deleteCollection = async (id: string) => {
    const token = localStorage.getItem('aura-token');
    if (!token) {
      alert('Please login to delete collection');
      return;
    }
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }
    try {
      await axios.delete(`/api/featured-collections/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Collection deleted successfully');
      fetchCollections();
    } catch (error) {
      alert('Failed to delete collection');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || images.length === 0) {
      alert('Please provide title and at least one image');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('aura-token');
    if (!token) {
      alert('Please login to add collection');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (name) formData.append('name', name);
      formData.append('title', title);
      formData.append('description', 'Featured collection');
      formData.append('link', '/products');
      formData.append('color', 'from-pink-500 to-purple-600');
      formData.append('type', 'theme');

      images.forEach((image) => {
        formData.append('image', image);
      });

      await axios.post('/api/featured-collections', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      alert('Collection added successfully');
      setTitle('');
      setName('');
      setImages([]);
      fetchCollections();
      onSuccess?.();
    } catch (error) {
      alert('Failed to add collection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Featured Collections</h3>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 rounded ${activeTab === 'add' ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
        >
          Add Collection
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`px-4 py-2 rounded ${activeTab === 'view' ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}
        >
          View Collections
        </button>
      </div>

      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name (shown on homepage)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter display name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300 mb-3"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Keyword (used to apply filter)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter collection title (used for filtering)"
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Images (Max 4)
          </label>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Image Button */}
          {images.length < 4 && (
            <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-pink-300 transition-colors">
              <div className="text-center">
                <Plus className="mx-auto h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">Add Images</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageAdd}
                className="hidden"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Collection'}
        </button>
        </form>
      )}

      {activeTab === 'view' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((collection) => (
              <div key={collection._id} className="border p-4 rounded relative">
                <button
                  onClick={() => deleteCollection(collection._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  title="Delete collection"
                >
                  <Trash2 size={16} />
                </button>
                <p><strong>{collection.title}</strong></p>
                <p>Type: <span className="capitalize">{collection.type}</span></p>
                <p>{collection.description}</p>
                <p>Link: {collection.link}</p>
                <p>Color: {collection.color}</p>
                {collection.image && (
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-32 h-32 mt-2"
                  />
                )}
              </div>
            ))}
          </div>
          {collections.length === 0 && (
            <p className="text-gray-500 text-center py-8">No collections found. Add your first collection!</p>
          )}
        </div>
      )}
    </div>
  );
};
