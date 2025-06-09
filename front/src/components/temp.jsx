import React, { useState } from "react";
import { countryData } from "../../public/data/countryData";
import { industryData } from "../../public/data/industryData";
import { budgetSizeData } from "../../public/data/budgetSizeData";
import axiosInstance from "@/utils/axiosInstance";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const ContactFormModal = ({ isOpen, setIsOpen }) => {
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    country: "",
    industry: "",
    budgetRange: "",
  });
  const [securityData, setSecurityData] = useState({
    email: "",
    securityKey: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (isReturningUser) {
      // Validation for returning users
      if (!securityData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(securityData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!securityData.securityKey.trim()) {
        newErrors.securityKey = "Security key is required";
      } else if (securityData.securityKey.length < 8) {
        newErrors.securityKey = "Security key must be at least 8 characters";
      }
    } else {
      // Validation for new users
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      }

      if (!formData.country) {
        newErrors.country = "Country is required";
      }

      if (!formData.industry) {
        newErrors.industry = "Industry is required";
      }

      if (!formData.budgetRange) {
        newErrors.budgetRange = "Budget range is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // device change
    if (isReturningUser) {
      try {
        const response = await axiosInstance.post(
          "/client/change-device",
          securityData
        );

        if (response.status === 200) {
          toast.success(
            "Welcome back! Your conversations have been restored. Please refresh the page to see them."
          );
          // window?.location.reload();

          if (response.data?.jwt_token) {
            Cookies.set("ivy-auth-token", response.data?.jwt_token, {
              expires: 365,
              secure: process.env.NODE_ENV === "production",
              sameSite: false,
            });
          }

          // Reset security form
          setSecurityData({
            email: "",
            securityKey: "",
          });

          setErrors({});
          setIsSubmitting(false);
          setIsOpen(false);
        }
      } catch (error) {
        setIsSubmitting(false);
        const errorMessage =
          error.response?.data?.message ||
          error?.message ||
          "Unexpected error!";

        toast.error(errorMessage);
      }
    }
    // registering new user
    else {
      const { name, phoneNumber, email, country, industry, budgetRange } =
        formData || {};

      const countryDetails = countryData.find(
        (country) => country.code == formData.country
      );
      const industryDetails = industryData.find(
        (industry) => industry.code == formData.industry
      );
      const budgetDetails = budgetSizeData.find(
        (budget) => budget.code == formData.budgetRange
      );

      const client_code = country + industry + budgetRange + "00";

      const newUserData = {
        name,
        phoneNumber,
        email,
        client_code,
        country: countryDetails.name,
        industry: industryDetails.name,
        budgetRange: budgetDetails.min + "-" + budgetDetails.max,
      };

      try {
        const response = await axiosInstance.post(
          "/client/create",
          newUserData
        );

        if (response.status === 201) {
          toast.success("Registration successful! Welcome to IVY!");

          if (response.data?.jwt_token) {
            Cookies.set("ivy-auth-token", response.data?.jwt_token, {
              expires: 365,
              secure: process.env.NODE_ENV === "production",
              sameSite: false,
            });
          }

          // Reset form
          setFormData({
            name: "",
            phoneNumber: "",
            email: "",
            country: "",
            industry: "",
            budgetRange: "",
          });

          setErrors({});
          setIsSubmitting(false);
          setIsOpen(false);
        }
      } catch (error) {
        setIsSubmitting(false);
        const errorMessage =
          error.response?.data?.message ||
          error?.message ||
          "Unexpected error!";

        toast.error(errorMessage);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (isReturningUser) {
      setSecurityData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/80 to-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-float"></div>
          <div className="absolute top-3/4 left-1/2 w-3 h-3 bg-purple-400/30 rounded-full animate-float-delay"></div>
          <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-400/30 rounded-full animate-float-slow"></div>
        </div>

        <div className="relative p-1 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 via-indigo-600 to-cyan-500 shadow-2xl w-full max-w-[90vw] lg:max-w-lg max-h-[90vh] animate-scaleIn">
          {/* Glowing effect */}
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 rounded-2xl blur opacity-30 animate-pulse"></div>

          <div className="relative bg-white rounded-2xl overflow-hidden h-full flex flex-col">
            {/* Modal Header with gradient background */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6 text-white flex-shrink-0">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>

              <div className="relative z-10">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-3">
                  {isReturningUser ? "Welcome Back to IVY" : "Welcome to IVY"}
                </h2>
                <p className="text-blue-100 text-sm lg:text-base">
                  {isReturningUser
                    ? "Enter your security credentials to restore your conversations and continue where you left off!"
                    : "Let's get you started with our AI assistant. Just a few details to personalize your experience!"}
                </p>
              </div>
            </div>

            {/* Form with enhanced styling */}
            <div className="flex-1 max-h-[70vh] overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* User Type Toggle */}
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button
                      type="button"
                      onClick={() => setIsReturningUser(false)}
                      className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        !isReturningUser
                          ? "bg-white text-blue-600 shadow-md"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      🆕 New User
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsReturningUser(true)}
                      className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                        isReturningUser
                          ? "bg-white text-purple-600 shadow-md"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      🔐 Returning User
                    </button>
                  </div>
                </div>

                <div className="">
                  {isReturningUser ? (
                    // Security Form for Returning Users
                    <div className="space-y-5">
                      <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">
                          🔒 Secure Access
                        </h3>
                        <p className="text-sm text-purple-600">
                          Enter your registered email and security key to
                          restore your conversations
                        </p>
                      </div>

                      {/* Email Field for Security */}
                      <div className="group">
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        >
                          📧 Registered Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={securityData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-sm lg:text-base group-hover:shadow-md ${
                            errors.email
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          placeholder="Enter your registered email"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Security Key Field */}
                      <div className="group">
                        <label
                          htmlFor="securityKey"
                          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        >
                          🔑 Security Key *
                        </label>
                        <input
                          type="text"
                          id="securityKey"
                          name="securityKey"
                          value={securityData.securityKey}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 text-sm lg:text-base group-hover:shadow-md ${
                            errors.securityKey
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          placeholder="Enter your security key"
                        />
                        {errors.securityKey && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.securityKey}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          💡 This was provided when you first registered
                        </p>
                      </div>

                      {/* Submit Button for Returning Users */}
                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-800 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg relative overflow-hidden group"
                        >
                          {/* Button glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Verifying Credentials...</span>
                            </>
                          ) : (
                            <>
                              <span>🔐</span>
                              <span>Restore My Conversations</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Help text for returning users */}
                      <div className="pt-4 text-center">
                        <p className="text-xs text-gray-500">
                          Don't have your security key?
                          <button
                            type="button"
                            onClick={() => setIsReturningUser(false)}
                            className="text-blue-600 hover:text-blue-800 ml-1 underline"
                          >
                            Register as new user
                          </button>
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Registration Form for New Users
                    <div className="space-y-5">
                      {/* Progress indicator */}
                      <div className="flex justify-center mb-6">
                        <div className="flex space-x-2">
                          {[1, 2, 3].map((step) => (
                            <div
                              key={step}
                              className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse"
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Name Field */}
                      <div className="group">
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        >
                          👤 Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base group-hover:shadow-md ${
                            errors.name
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          placeholder="Enter your full name"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Phone Number Field */}
                      <div className="group">
                        <label
                          htmlFor="phoneNumber"
                          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        >
                          📱 Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base group-hover:shadow-md ${
                            errors.phoneNumber
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          placeholder="Enter your phone number"
                        />
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.phoneNumber}
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className="group">
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        >
                          📧 Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base group-hover:shadow-md ${
                            errors.email
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          placeholder="Enter your email address"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.email}
                          </p>
                        )}
                      </div>

                      {/* Country Field */}
                      <div className="group">
                        <label
                          htmlFor="country"
                          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        >
                          🌍 Country *
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base group-hover:shadow-md appearance-none bg-white ${
                            errors.country
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <option value="">🔽 Select your country</option>
                          {countryData.map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.englishName}
                            </option>
                          ))}
                        </select>
                        {errors.country && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.country}
                          </p>
                        )}
                      </div>

                      {/* Industry Field */}
                      <div className="group">
                        <label
                          htmlFor="industry"
                          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        >
                          🏢 Industry *
                        </label>
                        <select
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base group-hover:shadow-md appearance-none bg-white ${
                            errors.industry
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <option value="">🔽 Select your industry</option>
                          {industryData.map((industry) => (
                            <option key={industry.code} value={industry.code}>
                              {industry.englishName}
                            </option>
                          ))}
                        </select>
                        {errors.industry && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.industry}
                          </p>
                        )}
                      </div>

                      {/* Budget Range Field */}
                      <div className="group">
                        <label
                          htmlFor="budgetRange"
                          className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                        >
                          💰 Budget Range *
                        </label>
                        <select
                          id="budgetRange"
                          name="budgetRange"
                          value={formData.budgetRange}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base group-hover:shadow-md appearance-none bg-white ${
                            errors.budgetRange
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <option value="">🔽 Select budget range</option>
                          {budgetSizeData.map((range) => (
                            <option key={range.code} value={range.code}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                        {errors.budgetRange && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠️</span> {errors.budgetRange}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg relative overflow-hidden group"
                        >
                          {/* Button glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Processing Magic...</span>
                            </>
                          ) : (
                            <>
                              <span>🚀</span>
                              <span>Launch My IVY Experience</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Trust indicators */}
                      <div className="pt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          🔒 Secure
                        </span>
                        <span className="flex items-center gap-1">
                          ⚡ Instant
                        </span>
                        <span className="flex items-center gap-1">
                          🎯 Personalized
                        </span>
                      </div>

                      {/* Already registered link */}
                      <div className="pt-4 text-center">
                        <p className="text-xs text-gray-500">
                          Already registered?
                          <button
                            type="button"
                            onClick={() => setIsReturningUser(true)}
                            className="text-purple-600 hover:text-purple-800 ml-1 underline"
                          >
                            Access with security key
                          </button>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              transform: scale(0.9);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          @keyframes float-delay {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }

          @keyframes float-slow {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }

          .animate-scaleIn {
            animation: scaleIn 0.4s ease-out;
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          .animate-float-delay {
            animation: float-delay 4s ease-in-out infinite;
          }

          .animate-float-slow {
            animation: float-slow 5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default ContactFormModal;
