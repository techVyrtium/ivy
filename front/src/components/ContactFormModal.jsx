"use clinet";
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { countryData } from "../../public/data/countryData";
import { industryData } from "../../public/data/industryData";
import { budgetSizeData } from "../../public/data/budgetSizeData";
import BusinessTypeComponent from "./registrationsComponents/BusinessType";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axiosInstance";
import Cookies from "js-cookie";
import { useChat } from "../hooks/useChat.js";

const businessTypes = [
  "Personal Brand",
  "Entrepreneurship",
  "Pyme",
  "Company",
  "Firm",
];

const marketOptions = [
  "Food & Beverages",
  "Home & Furniture",
  "Technology & Electronics",
  "Fashion & Accessories",
  "Health & Wellness",
  "Beauty & Personal Care",
  "Automotive",
  "Sports & Outdoors",
  "Pets",
  "Babies & Maternity",
  "Games & Toys",
  "Books & Media & Art",
  "Stationary & Office",
  "Gardening & Outdoors",
  "Construction & Hardware",
  "Legal Services",
  "Education",
];

const deliveryTimeOptions = [
  "Urgent 24hr",
  "Medium 48hr",
  "Standard 3-5 days",
  "High Value Projects up to 5 days",
];

const ContactFormModal = ({ isOpen, setIsOpen }) => {
  const { sendMessage, setInputValue } = useChat();
  const [currentStep, setCurrentStep] = useState(1);
  const [isReturningUser, setIsReturningUser] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    language: "",
    phoneNumber: "",
    budgetRange: "",
    deliveryTime: "",
    continuePath: "",
  });

  const [businessData, setBusinessData] = useState({
    businessTypes: [],
    otherBusinessType: "",
  });

  const [securityData, setSecurityData] = useState({
    email: "",
    securityKey: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [otherValue, setOtherValue] = useState("");

  const totalSteps = 5;

  const validateReturningUser = () => {
    const newErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid";
        }
        if (!formData.country) newErrors.country = "Country is required";
        if (!formData.phoneNumber.trim() || formData.phoneNumber?.length < 6)
          // at least 6 digit needed
          newErrors.phoneNumber = "Phone number is required";
        break;
      case 2:
        if (!formData.industry)
          newErrors.industry = "Market selection is required";
        if (!formData.budgetRange)
          newErrors.budgetRange = "Budget selection is required";
        break;
      case 3:
        if (selectedTypes.length === 0) {
          newErrors.businessTypes = "Please select at least one business type";
        }

        if (selectedTypes.includes("Other") && !otherValue.trim()) {
          newErrors.otherValue = "Please specify your business type";
        }
        break;
      case 4:
        if (!formData.deliveryTime)
          newErrors.deliveryTime = "Delivery time is required";
        break;
      case 5:
        if (!formData.continuePath)
          newErrors.continuePath = "Please select how to continue";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
    setErrors({});
  };

  // get old user's conversation back form old device/browser
  const handleReturningUserSubmit = async () => {
    if (!validateReturningUser()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        "/client/change-device",
        securityData
      );

      if (response.status === 200) {
        toast.success("Welcome back! Your conversations have been restored.");
        window?.location.reload();

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
        error.response?.data?.message || error?.message || "Unexpected error!";

      toast.error(errorMessage);
    }
  };

  // register new user
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const {
      name,
      phoneNumber,
      email,
      country,
      industry,
      budgetRange,
      language,
      market,
      deliveryTime,
      continuePath,
    } = formData || {};

    const { businessTypes, otherBusinessType } = businessData;

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
      language,
      market,
      deliveryTime,
      businessTypes,
      otherBusinessType,
    };

    try {
      const response = await axiosInstance.post("/client/create", newUserData);

      if (response.status === 201) {
        toast.success("Registration successful! Welcome to IVY!");

        if (response.data?.jwt_token) {
          Cookies.set("ivy-auth-token", response.data?.jwt_token, {
            expires: 365,
            secure: process.env.NODE_ENV === "production",
            sameSite: false,
          });
        }

        if (continuePath === "human") {
          await sendMessage("I want to contact with human agent");
          window?.location.reload();
        }

        // Reset form
        setIsOpen(false);
        setCurrentStep(1);
        setFormData({
          name: "",
          email: "",
          company: "",
          country: "",
          language: "",
          phoneNumber: "",
          budgetRange: "",
          deliveryTime: "",
          continuePath: "",
        });

        setBusinessData({
          businessTypes: [],
          otherBusinessType: "",
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage =
        error.response?.data?.message || error?.message || "Unexpected error!";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSecurityInputChange = (e) => {
    const { name, value } = e.target;
    setSecurityData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value }));

    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  const renderReturningUserForm = () => {
    return (
      <div className="space-y-6">
        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-2">
            🔒 Secure Access
          </h3>
          <p className="text-sm text-purple-600">
            Enter your registered email and security key to restore your
            conversations
          </p>
        </div>

        <div className="space-y-5">
          {/* Email Field for Security */}
          <div className="group">
            <label
              htmlFor="security-email"
              className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              📧 Registered Email *
            </label>
            <input
              type="email"
              id="security-email"
              name="email"
              value={securityData.email}
              onChange={handleSecurityInputChange}
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
              onChange={handleSecurityInputChange}
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
              onClick={handleReturningUserSubmit}
              disabled={isSubmitting}
              className="cursor-pointer w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-800 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg relative overflow-hidden group"
            >
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
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                📋 Basic Information
              </h3>
              <p className="text-sm text-gray-600">
                Let's start with your basic details
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  👤 Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📱 Phone *
                </label>
                <PhoneInput
                  country={"us"}
                  value={formData.phoneNumber}
                  onChange={handlePhoneChange}
                  enableSearch
                  inputClass={`!w-full  !py-5 !border !rounded-lg !focus:outline-none !focus:ring-2 !focus:ring-blue-500 ${
                    errors.phoneNumber
                      ? "!border-red-400 !bg-red-50"
                      : "!border-gray-300"
                  }`}
                  containerClass="!w-full"
                  buttonClass="!border-gray-300 !rounded-l-lg"
                  placeholder="Enter phone number"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.company
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Company name"
                />
                {errors.company && (
                  <p className="text-red-500 text-xs mt-1">{errors.company}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🗣️ Language
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.language
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Your preferred language"
                />
                {errors.language && (
                  <p className="text-red-500 text-xs mt-1">{errors.language}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🎯 Industry & Budget Selection
              </h3>
              <p className="text-sm text-gray-600">
                What industry are you in? & your budget range (USD)
              </p>
            </div>

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
          </div>
        );

      case 3:
        return (
          <BusinessTypeComponent
            payload={{
              errors,
              setErrors,
              selectedTypes,
              setSelectedTypes,
              otherValue,
              setOtherValue,
              businessData,
              setBusinessData,
            }}
          />
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ⏰ Project Timeline
              </h3>
              <p className="text-sm text-gray-600">
                Time to deliver the project (available in working days)
              </p>
            </div>

            <div className="space-y-3">
              {deliveryTimeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, deliveryTime: time }))
                  }
                  className={`w-full p-4 text-left border rounded-lg transition-all hover:shadow-md ${
                    formData.deliveryTime === time
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-semibold">{time}</div>
                </button>
              ))}
            </div>
            {errors.deliveryTime && (
              <p className="text-red-500 text-sm mt-2">{errors.deliveryTime}</p>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🤝 How to Continue
              </h3>
              <p className="text-sm text-gray-600">
                Do you want to continue here or with a human sales person?
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, continuePath: "ai" }))
                }
                className={`w-full p-6 text-left border-2 rounded-xl transition-all hover:shadow-lg ${
                  formData.continuePath === "ai"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🤖</div>
                  <div>
                    <div className="font-bold text-lg text-blue-700">
                      Continue with AI
                    </div>
                    <div className="text-sm text-gray-600">
                      Continue your conversation with our AI assistant
                    </div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, continuePath: "human" }))
                }
                className={`w-full p-6 text-left border-2 rounded-xl transition-all hover:shadow-lg ${
                  formData.continuePath === "human"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-green-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">👨‍💼</div>
                  <div>
                    <div className="font-bold text-lg text-green-700">
                      Human Sales Person
                    </div>
                    <div className="text-sm text-gray-600">
                      Connect with our human sales team
                    </div>
                  </div>
                </div>
              </button>
            </div>
            {errors.continuePath && (
              <p className="text-red-500 text-sm mt-2">{errors.continuePath}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/80 to-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-float"></div>
        <div className="absolute top-3/4 left-1/2 w-3 h-3 bg-purple-400/30 rounded-full animate-float-delay"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-400/30 rounded-full animate-float-slow"></div>
      </div>

      <div className="relative p-1 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 via-indigo-600 to-cyan-500 shadow-2xl w-full max-w-[90vw] lg:max-w-3xl max-h-[90vh] animate-scaleIn">
        {/* Glowing effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 rounded-2xl blur opacity-30 animate-pulse"></div>

        <div className="relative bg-white rounded-2xl overflow-hidden h-full flex flex-col">
          {/* Modal Header with gradient background */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-6 text-white flex-shrink-0">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-10 -translate-x-10"></div>

            <div className="relative z-10 flex justify-between items-start">
              <div>
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

            {/* User Type Toggle */}
            <div className="relative z-10 flex justify-center mt-6">
              <div className="bg-white/20 backdrop-blur-sm p-1 rounded-xl flex">
                <button
                  type="button"
                  onClick={() => setIsReturningUser(false)}
                  className={`cursor-pointer px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    !isReturningUser
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  🆕 New User
                </button>
                <button
                  type="button"
                  onClick={() => setIsReturningUser(true)}
                  className={`cursor-pointer px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    isReturningUser
                      ? "bg-white text-purple-600 shadow-md"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  🔐 Returning User
                </button>
              </div>
            </div>

            {/* Progress Bar for New Users */}
            {!isReturningUser && (
              <p className="text-sm text-blue-100">
                Step {currentStep} of {totalSteps}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 max-h-[60vh] overflow-y-auto">
            <div className="p-6">
              {isReturningUser
                ? renderReturningUserForm()
                : renderStepContent()}
            </div>
          </div>

          {/* Footer - Only show for new users */}
          {!isReturningUser && (
            <div className="border-t border-t-gray-400 bg-gray-50 px-6 py-4 flex justify-between flex-shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="cursor-pointer px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {currentStep === totalSteps ? "Complete Registration" : "Next"}
              </button>
            </div>
          )}
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

        /* Custom styles for react-phone-input-2 */
        .react-tel-input .form-control {
          width: 100% !important;
          height: auto !important;
          padding: 8px 12px !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem !important;
          font-size: 14px !important;
        }

        .react-tel-input .form-control:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          outline: none !important;
        }

        .react-tel-input .flag-dropdown {
          border: 1px solid #d1d5db !important;
          border-radius: 0.5rem 0 0 0.5rem !important;
          background: white !important;
        }

        .react-tel-input .selected-flag {
          padding: 8px 12px !important;
        }

        .react-tel-input .country-list {
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default ContactFormModal;
