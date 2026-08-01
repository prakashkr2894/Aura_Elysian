import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Star,
  Upload,
  User,
  MessageSquare,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface Testimonial {
  _id: string;
  name: string;
  text: string;
  rating: number;
  image: string;
}

interface TrendingProduct {
  _id: string;
  name: string;
  price: number;
  primaryImage: string;
}

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

export const ManageContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "testimonials" | "trending" | "featuredCollections"
  >("testimonials");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>(
    [],
  );
  const [featuredCollections, setFeaturedCollections] = useState<
    FeaturedCollection[]
  >([]);

  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    text: "",
    rating: 5,
    image: null as File | null,
  });

  const [newTrendingProduct, setNewTrendingProduct] = useState({
    productId: "",
    images: [] as File[],
    festival: "",
    description: "",
    category: "",
    fragrance: "",
    weight: "",
    container: "",
  });

  const [newCollection, setNewCollection] = useState({
    name: "",
    title: "",
    description: "Featured collection",
    link: "/products",
    color: "from-pink-500 to-purple-600",
    type: "theme",
    images: [] as File[],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    checkTokenValidity();
  }, []);

  const checkTokenValidity = async () => {
    const token = localStorage.getItem("aura-token");
    if (!token) {
      return;
    }

    try {
      const response = await axios.get("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 401) {
        localStorage.removeItem("aura-token");
        window.location.href = "/team/login";
      }
    }
  };

  const fetchData = async () => {
    try {
      const [testRes, trendRes, collectionsRes] = await Promise.all([
        axios.get("/api/testimonials"),
        axios.get("/api/trending-products"),
        axios.get("/api/featured-collections"),
      ]);
      setTestimonials(testRes.data);
      setTrendingProducts(trendRes.data);
      setFeaturedCollections(collectionsRes.data);
    } catch (error) {
    }
  };

  const handleTestimonialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewTestimonial((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestimonialImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setNewTestimonial((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setNewTestimonial((prev) => ({ ...prev, rating }));
  };

  const submitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("aura-token");
    if (!token) {
      alert("Please login to add testimonial");
      return;
    }
    const formData = new FormData();
    formData.append("name", newTestimonial.name);
    formData.append("text", newTestimonial.text);
    formData.append("rating", newTestimonial.rating.toString());
    if (newTestimonial.image) {
      formData.append("image", newTestimonial.image);
    }
    try {
      await axios.post("/api/testimonials", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Testimonial added successfully");
      setNewTestimonial({ name: "", text: "", rating: 5, image: null });
      fetchData();
    } catch (error) {
      alert("Failed to add testimonial");
    }
  };

  const deleteTestimonial = async (id: string) => {
    const token = localStorage.getItem("aura-token");
    if (!token) {
      alert("Please login to delete testimonial");
      return;
    }
    if (!confirm("Are you sure you want to delete this testimonial?")) {
      return;
    }
    try {
      await axios.delete(`/api/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Testimonial deleted successfully");
      fetchData();
    } catch (error) {
      alert("Failed to delete testimonial");
    }
  };

  const submitTrendingProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("aura-token");
    if (!token) {
      alert("Please login to add trending product");
      return;
    }
    const formData = new FormData();
    formData.append("productId", newTrendingProduct.productId);
    try {
      await axios.post("/api/trending-products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Trending product added successfully");
      setNewTrendingProduct({
        productId: "",
        images: [],
        festival: "",
        description: "",
        category: "",
        fragrance: "",
        weight: "",
        container: "",
      });
      fetchData();
    } catch (error) {
      alert("Failed to add trending product");
    }
  };

  const removeTrendingProduct = async (id: string) => {
    const token = localStorage.getItem("aura-token");
    if (!token) {
      alert("Please login to remove trending product");
      return;
    }
    if (!confirm("Are you sure you want to remove this trending product?")) {
      return;
    }
    try {
      await axios.delete(`/api/trending-products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Trending product removed successfully");
      fetchData();
    } catch (error) {
      alert("Failed to remove trending product");
    }
  };

  const handleCollectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCollection((prev) => ({ ...prev, [name]: value }));
  };

  const handleCollectionImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewCollection((prev) => ({
        ...prev,
        images: [...prev.images, ...filesArray].slice(0, 4), // max 4 images
      }));
    }
  };

  const removeCollectionImage = (index: number) => {
    setNewCollection((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const submitFeaturedCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollection.title.trim() || newCollection.images.length === 0) {
      alert("Please provide title and at least one image");
      return;
    }

    setLoading(true);
    const token =
      localStorage.getItem("aura-token") || localStorage.getItem("token");

    if (!token) {
      alert("Please login to add collection");
      setLoading(false);
      return;
    }

    try {
      const testResponse = await axios.get("/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (testError: unknown) {
      if (testError && typeof testError === 'object' && 'response' in testError && testError.response && typeof testError.response === 'object' && 'status' in testError.response && testError.response.status === 401) {
        alert("Your session has expired. Please login again.");
        localStorage.removeItem("aura-token");
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }
    }

    try {
      const formData = new FormData();
      if (newCollection.name) {
        formData.append("name", newCollection.name);
      }
      formData.append("title", newCollection.title);
      formData.append("description", newCollection.description);
      formData.append("link", newCollection.link);
      formData.append("color", newCollection.color);
      formData.append("type", newCollection.type);

      newCollection.images.forEach((image) => {
        formData.append("image", image);
      });

      await axios.post("/api/featured-collections", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Collection added successfully");
      setNewCollection({
        name: "",
        title: "",
        description: "Featured collection",
        link: "/products",
        color: "from-pink-500 to-purple-600",
        type: "theme",
        images: [],
      });
      fetchData();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 401) {
        alert("Authentication failed. Please login again.");
        localStorage.removeItem("aura-token");
        window.location.href = "/team/login";
      } else {
        alert("Failed to add collection");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteFeaturedCollection = async (id: string) => {
    const token = localStorage.getItem("aura-token");
    if (!token) {
      alert("Please login to delete collection");
      return;
    }
    if (!confirm("Are you sure you want to delete this collection?")) {
      return;
    }
    try {
      await axios.delete(`/api/featured-collections/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Collection deleted successfully");
      fetchData();
    } catch (error) {
      alert("Failed to delete collection");
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          Manage Content
        </h2>

        <div className="flex flex-wrap gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("testimonials")}
            className={`px-4 sm:px-6 py-3 rounded-md font-semibold transition-all text-sm sm:text-base ${
              activeTab === "testimonials"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Testimonials
          </button>
          <button
            onClick={() => setActiveTab("trending")}
            className={`px-4 sm:px-6 py-3 rounded-md font-semibold transition-all text-sm sm:text-base ${
              activeTab === "trending"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Trending Products
          </button>
          <button
            onClick={() => setActiveTab("featuredCollections")}
            className={`px-4 sm:px-6 py-3 rounded-md font-semibold transition-all text-sm sm:text-base ${
              activeTab === "featuredCollections"
                ? "bg-white text-pink-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Featured Collections
          </button>
        </div>

        {activeTab === "testimonials" && (
          <div className="space-y-8">
            {/* Add New Testimonial Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-pink-600" />
                Add New Testimonial
              </h3>

              <form onSubmit={submitTestimonial} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Profile Picture */}
                  <div className="lg:col-span-1">
                    <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile Picture
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTestimonialImageChange}
                        className="hidden"
                        id="testimonial-image"
                      />
                      <label
                        htmlFor="testimonial-image"
                        className="cursor-pointer"
                      >
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                          <p className="text-sm text-gray-600">
                            {newTestimonial.image
                              ? newTestimonial.image.name
                              : "Click to upload profile picture"}
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter customer name"
                      value={newTestimonial.name}
                      onChange={handleTestimonialChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Review Text
                  </label>
                  <textarea
                    name="text"
                    placeholder="Write the customer testimonial..."
                    value={newTestimonial.text}
                    onChange={handleTestimonialChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent resize-none"
                  />
                </div>

                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= newTestimonial.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-sm text-gray-600 self-center">
                      {newTestimonial.rating} out of 5 stars
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Add Testimonial
                  </button>
                </div>
              </form>
            </div>

            {/* Display Testimonials */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-pink-600" />
                Customer Testimonials ({testimonials.length})
              </h3>

              {testimonials.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No testimonials yet</p>
                  <p className="text-gray-400 text-sm">
                    Add your first testimonial above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((testimonial) => (
                    <motion.div
                      key={testimonial._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {testimonial.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="h-4 w-4 text-yellow-400 fill-current"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTestimonial(testimonial._id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                          title="Delete testimonial"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        "{testimonial.text}"
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "trending" && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">
                Manage Trending Products
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {trendingProducts.map((product) => (
                  <div
                    key={product._id}
                    className="border border-gray-200 rounded-lg p-4 relative"
                  >
                    <button
                      onClick={() => removeTrendingProduct(product._id)}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Remove
                    </button>
                    <div className="flex gap-4">
                      {product.primaryImage && (
                        <img
                          src={product.primaryImage}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {product.name}
                        </h4>
                        <p className="text-gray-600">₹{product.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={submitTrendingProduct}
                className="space-y-4 max-w-md"
              >
                <input
                  type="text"
                  name="productId"
                  placeholder="Product ID (from products collection)"
                  value={newTrendingProduct.productId || ""}
                  onChange={(e) =>
                    setNewTrendingProduct((prev) => ({
                      ...prev,
                      productId: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700"
                >
                  Add Trending Product
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "featuredCollections" && (
          <div className="space-y-8">
            {/* Add New Featured Collection Form */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-pink-600" />
                Add New Featured Collection
              </h3>

              <form onSubmit={submitFeaturedCollection} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Display Name (shown on homepage)
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter display name"
                      value={newCollection.name}
                      onChange={handleCollectionChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent mb-4"
                    />

                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Filter Keyword (used to apply filter)
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter collection title (used for filtering)"
                      value={newCollection.title}
                      onChange={handleCollectionChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Images Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Images (Max 4)
                  </label>

                  {/* Image Preview Grid */}
                  {newCollection.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {newCollection.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeCollectionImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Image Button */}
                  {newCollection.images.length < 4 && (
                    <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-pink-300 transition-colors">
                      <div className="text-center">
                        <Plus className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Add Images
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleCollectionImagesChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Adding..." : "Add Collection"}
                  </button>
                </div>
              </form>
            </div>

            {/* Display Featured Collections */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-pink-600" />
                Featured Collections ({featuredCollections.length})
              </h3>

              {featuredCollections.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No featured collections yet
                  </p>
                  <p className="text-gray-400 text-sm">
                    Add your first collection above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredCollections.map((collection) => (
                    <motion.div
                      key={collection._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {collection.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2">
                            {collection.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Type:{" "}
                            <span className="capitalize">
                              {collection.type}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Link: {collection.link}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            deleteFeaturedCollection(collection._id)
                          }
                          className="text-red-500 hover:text-red-700 p-1 rounded transition-colors ml-2"
                          title="Delete collection"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {collection.image && (
                        <img
                          src={collection.image}
                          alt={collection.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
