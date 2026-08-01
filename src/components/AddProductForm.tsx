import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, UploadCloud } from "lucide-react";
import axios from "axios";
import { useFilters } from "../hooks/useFilters";

type ProductType = "Candle";
type ContainerType = "Glass" | "No Glass";

interface FormData {
  productName: string;
  images: File[];
  primaryIndex: number;
  theme: string;
  fragrance: string;
  weight: string;
  container: ContainerType;
  festival: string[];
  description: string;
  price: string;
  productType: ProductType;
  rating?: string;
}

interface Step1Props {
  nextStep: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setProductType: (type: ProductType) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface Step2Props {
  nextStep: () => void;
  prevStep: () => void;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setContainer: (container: ContainerType) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface Step3Props {
  prevStep: () => void;
  formData: FormData;
  handleSubmit: () => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export const AddProductForm: React.FC = () => {
  const { refreshFilters } = useFilters();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    productName: "",
    images: [],
    primaryIndex: 0,
    theme: "",
    fragrance: "",
    weight: "",
    container: "Glass",
    festival: [],
    description: "",
    price: "",
    productType: "Candle",
    rating: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...fileArray].slice(0, 5),
      }));
    }
  };

  const setProductType = (type: ProductType) => {
    setFormData((prev) => ({ ...prev, productType: type }));
  };

  const setContainer = (container: ContainerType) => {
    setFormData((prev) => ({ ...prev, container }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("aura-token");
    if (!token) {
      alert("You are not authorized. Please log in.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.productName);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("category", formData.productType);
    formDataToSend.append("theme", formData.theme);
    formDataToSend.append("fragrance", formData.fragrance);
    formDataToSend.append("weight", formData.weight);
    formDataToSend.append("container", formData.container);
    formDataToSend.append("festival", JSON.stringify(formData.festival));
    formDataToSend.append("description", formData.description);
    formDataToSend.append("primaryIndex", formData.primaryIndex.toString());
    if (formData.rating !== undefined && formData.rating !== "") {
      formDataToSend.append("rating", formData.rating);
    }

    if (formData.images.length > 0) {
      formData.images.forEach((file) => {
        formDataToSend.append("images", file);
      });
    }

    try {
      const response = await axios.post("/api/products", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Product added successfully!");

      await refreshFilters();

      setStep(1);
      setFormData({
        productName: "",
        images: [],
        primaryIndex: 0,
        theme: "",
        fragrance: "",
        weight: "",
        container: "Glass",
        festival: [],
        description: "",
        price: "",
        productType: "Candle",
        rating: "",
      });
    } catch (error) {
      alert("Failed to add product.");
    }
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            nextStep={nextStep}
            formData={formData}
            setFormData={setFormData}
            setProductType={setProductType}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
          />
        );
      case 2:
        return (
          <Step2
            nextStep={nextStep}
            prevStep={prevStep}
            formData={formData}
            setFormData={setFormData}
            setContainer={setContainer}
            handleChange={handleChange}
          />
        );
      case 3:
        return (
          <Step3
            prevStep={prevStep}
            formData={formData}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
          />
        );
      default:
        return (
          <Step1
            nextStep={nextStep}
            formData={formData}
            setFormData={setFormData}
            setProductType={setProductType}
            handleChange={handleChange}
            handleFileChange={handleFileChange}
          />
        );
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-2">Add a New Product</h2>
      <p className="text-gray-500 mb-6">Step {step} of 3</p>
      <div className="relative h-[450px] overflow-y-auto">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>
    </div>
  );
};

const stepVariants = {
  initial: (direction: number) => ({ x: `${direction * 100}%`, opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: `${direction * -100}%`, opacity: 0 }),
};

const Step1 = ({
  nextStep,
  formData,
  setFormData,
  handleChange,
  handleFileChange,
}: Step1Props) => {
  const [direction] = useState(1);
  return (
    <motion.div
      key="step1"
      custom={direction}
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-6 absolute w-full"
    >
      <div>
        <label className="font-medium text-gray-800">
          Product Images (1-5)
        </label>
        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none"
              >
                <span>Upload files</span>
                <input
                  id="file-upload"
                  name="images"
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB each, max 5
            </p>
          </div>
        </div>
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {formData.images.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md"
                />
                <input
                  type="radio"
                  name="primary"
                  checked={formData.primaryIndex === index}
                  onChange={() => {
                    setFormData((prev: FormData) => ({
                      ...prev,
                      primaryIndex: index,
                    }));
                  }}
                  className="absolute top-1 left-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev: FormData) => {
                      const newImages = prev.images.filter(
                        (_, i) => i !== index,
                      );
                      let newPrimaryIndex = prev.primaryIndex;
                      if (prev.primaryIndex === index) {
                        newPrimaryIndex = 0;
                      } else if (prev.primaryIndex > index) {
                        newPrimaryIndex = prev.primaryIndex - 1;
                      }
                      return {
                        ...prev,
                        images: newImages,
                        primaryIndex: newPrimaryIndex,
                      };
                    });
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="productName" className="font-medium text-gray-800">
          Product Name
        </label>
        <input
          type="text"
          id="productName"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          placeholder="e.g., Lavender Dreams"
          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold"
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

const Step2 = ({
  nextStep,
  prevStep,
  formData,
  setFormData,
  setContainer,
  handleChange,
}: Step2Props) => {
  const [direction] = useState(1);

  return (
    <motion.div
      key="step2"
      custom={direction}
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-4 absolute w-full"
    >
      <div>
        <label htmlFor="theme" className="font-medium text-gray-800">
          Theme
        </label>
        <input
          type="text"
          id="theme"
          name="theme"
          value={formData.theme}
          onChange={handleChange}
          placeholder="e.g., Minimalist, Rustic"
          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </div>

      {formData.productType === "Candle" && (
        <div>
          <label htmlFor="fragrance" className="font-medium text-gray-800">
            Fragrance
          </label>
          <input
            type="text"
            id="fragrance"
            name="fragrance"
            value={formData.fragrance}
            onChange={handleChange}
            placeholder="e.g., Vanilla, Rose"
            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="weight" className="font-medium text-gray-800">
            Weight (grams)
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g., 200"
            className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        {formData.productType === "Candle" && (
          <div>
            <label className="font-medium text-gray-800">Container</label>
            <div className="flex gap-4 mt-2">
              {(["Glass", "No Glass"] as ContainerType[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setContainer(c)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${formData.container === c ? "bg-pink-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="festival" className="font-medium text-gray-800">
          Festival Themed
        </label>
        <input
          type="text"
          id="festival"
          name="festival"
          value={formData.festival.join(", ")}
          onChange={(e) => {
            const festivals = e.target.value
              .split(",")
              .map((f) => f.trim())
              .filter((f) => f.length > 0);
            setFormData((prev) => ({ ...prev, festival: festivals }));
          }}
          placeholder="e.g., Valentine, Halloween, Birthday"
          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center gap-2 text-gray-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold"
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

const Step3 = ({
  prevStep,
  formData,
  handleSubmit,
  handleChange,
}: Step3Props) => {
  const [direction] = useState(1);
  return (
    <motion.div
      key="step3"
      custom={direction}
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-6 absolute w-full"
    >
      <div>
        <label htmlFor="description" className="font-medium text-gray-800">
          Product Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe the product..."
          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300"
        ></textarea>
      </div>
      <div>
        <label htmlFor="price" className="font-medium text-gray-800">
          Price
        </label>
        <div className="relative mt-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            ₹
          </span>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
      </div>
      <div>
        <label htmlFor="rating" className="font-medium text-gray-800">
          Rating (0 - 5)
        </label>
        <input
          type="number"
          id="rating"
          name="rating"
          min={0}
          max={5}
          step={0.1}
          value={formData.rating || ""}
          onChange={handleChange}
          placeholder="e.g., 4.5"
          className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center gap-2 text-gray-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl"
        >
          Upload Product
        </button>
      </div>
    </motion.div>
  );
};
