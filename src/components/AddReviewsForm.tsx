import React, { useState } from "react";
import { Star } from "lucide-react";
import axios from "axios";

interface ReviewData {
  name: string;
  text: string;
  rating: number;
  image: File | null;
  reviewImages: File[];
  orderId: string;
  isProductReview: boolean;
  productId: string;
}

export const AddReviewsForm: React.FC = () => {
  const [reviewData, setReviewData] = useState<ReviewData>({
    name: "",
    text: "",
    rating: 5,
    image: null,
    reviewImages: [],
    orderId: "",
    isProductReview: false,
    productId: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setReviewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleReviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setReviewData((prev) => ({
        ...prev,
        reviewImages: [...prev.reviewImages, ...filesArray].slice(0, 3), // max 3
      }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setReviewData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("aura-token");
    if (!token) {
      alert("You are not authorized. Please log in.");
      return;
    }

    if (reviewData.isProductReview && !reviewData.productId) {
      alert("Please enter the Product ID.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", reviewData.name);
    formDataToSend.append("text", reviewData.text);
    formDataToSend.append("rating", reviewData.rating.toString());
    formDataToSend.append("orderId", reviewData.orderId);

    if (reviewData.isProductReview) {
      formDataToSend.append("productId", reviewData.productId);
    }

    if (reviewData.image) {
      formDataToSend.append("image", reviewData.image);
    }

    if (reviewData.isProductReview) {
      reviewData.reviewImages.forEach((file) =>
        formDataToSend.append("images", file),
      );
    }

    try {
      const url = reviewData.isProductReview
        ? "/api/productreviews"
        : "/api/testimonials";

      await axios.post(url, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Review added successfully!");
      setReviewData({
        name: "",
        text: "",
        rating: 5,
        image: null,
        reviewImages: [],
        orderId: "",
        isProductReview: false,
        productId: "",
      });
    } catch (error) {
      alert("Failed to add review.");
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Add a New Review</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="orderId" className="font-medium text-gray-800">
            Order ID
          </label>
          <input
            type="text"
            id="orderId"
            name="orderId"
            value={reviewData.orderId}
            onChange={handleChange}
            required
            placeholder="Enter your Order ID"
            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <div>
          <label className="font-medium text-gray-800">
            Profile Picture (Required)
          </label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="profile-image-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none"
                >
                  <span>
                    {reviewData.image ? reviewData.image.name : "Upload a file"}
                  </span>
                  <input
                    id="profile-image-upload"
                    name="image"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    required
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="name" className="font-medium text-gray-800">
            Customer Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={reviewData.name}
            onChange={handleChange}
            required
            placeholder="e.g., John Doe"
            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={reviewData.isProductReview}
              onChange={(e) =>
                setReviewData((prev) => ({
                  ...prev,
                  isProductReview: e.target.checked,
                }))
              }
              className="mr-2"
            />
            Is this a review of a product?
          </label>
        </div>

        {reviewData.isProductReview && (
          <div>
            <label htmlFor="productId" className="font-medium text-gray-800">
              Product ID
            </label>
            <input
              type="text"
              id="productId"
              name="productId"
              value={reviewData.productId}
              onChange={handleChange}
              required
              placeholder="Enter the Product ID"
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        )}

        <div>
          <label className="font-medium text-gray-800">
            Product Pictures (Optional, max 3)
          </label>
          <div className="mt-2">
            <div className="flex gap-2">
              {reviewData.reviewImages.map((file, index) => (
                <div
                  key={index}
                  className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-300"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setReviewData((prev) => ({
                        ...prev,
                        reviewImages: prev.reviewImages.filter(
                          (_, i) => i !== index,
                        ),
                      }))
                    }
                    className="absolute top-1 right-1 bg-pink-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {reviewData.reviewImages.length < 3 && (
                <label
                  htmlFor="review-images-upload"
                  className="flex items-center justify-center w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer text-pink-600 text-2xl font-bold"
                >
                  +
                  <input
                    id="review-images-upload"
                    name="images"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleReviewImageChange}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="text" className="font-medium text-gray-800">
            Review Text
          </label>
          <textarea
            id="text"
            name="text"
            value={reviewData.text}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Write the review..."
            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        <div>
          <label className="font-medium text-gray-800">Rating</label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => handleRatingChange(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= reviewData.rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl"
          >
            Add Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReviewsForm;
