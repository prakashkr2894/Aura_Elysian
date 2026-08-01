import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus } from "lucide-react";

export const SignupPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(`/api/signup`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Signup failed");
      }

      const data = await response.json();


      const { result, token } = data;



      localStorage.setItem("token", token);


      navigate("/");
    } catch (err: unknown) {

      setError(err instanceof Error ? err.message : "An error occurred");
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
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">Join us today!</p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            variants={{
              initial: { transition: { staggerChildren: 0.1 } },
              animate: { transition: { staggerChildren: 0.1 } },
            }}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            <div className="flex flex-col items-center mb-6">
              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : "https://cdn-icons-png.freepik.com/512/8861/8861091.png"
                }
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
              <button
                type="button"
                onClick={() =>
                  document.getElementById("profileImageInput")?.click()
                }
                className="mt-2 w-full max-w-xs px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors shadow-md whitespace-nowrap"
              >
                Upload your profile picture
              </button>
              <input
                id="profileImageInput"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files ? e.target.files[0] : null)
                }
                className="hidden"
              />
            </div>
            <motion.div variants={fadeInUp} className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
              />
            </motion.div>

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

            <motion.div variants={fadeInUp}>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <UserPlus className="h-5 w-5" />
                Sign Up
              </button>
            </motion.div>
          </motion.form>

          <motion.div variants={fadeInUp} className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-purple-600 hover:text-purple-800 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
