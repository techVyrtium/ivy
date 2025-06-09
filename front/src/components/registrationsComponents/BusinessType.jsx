import React from "react";

const BusinessTypeComponent = ({ payload }) => {
  const {
    errors,
    setErrors,
    selectedTypes,
    setSelectedTypes,
    otherValue,
    setOtherValue,
    businessData,
    setBusinessData,
  } = payload || {};

  const onSelectionChange = (data) => {
    setBusinessData(data);
  };

  const businessTypes = [
    "Personal Brand",
    "Entrepreneurship",
    "Pyme",
    "Company",
    "Firm",
  ];

  const handleCheckboxChange = (businessType) => {
    let updatedTypes;

    if (selectedTypes.includes(businessType)) {
      updatedTypes = selectedTypes.filter((type) => type !== businessType);
    } else {
      updatedTypes = [...selectedTypes, businessType];
    }

    setSelectedTypes(updatedTypes);

    // Clear error when user makes a selection
    if (errors.businessTypes) {
      setErrors((prev) => ({ ...prev, businessTypes: "" }));
    }

    // Call parent callback with updated data
    const finalData = {
      businessTypes: updatedTypes,
      otherBusinessType:
        selectedTypes.includes("Other") || updatedTypes.includes("Other")
          ? otherValue
          : "",
    };

    if (onSelectionChange) {
      onSelectionChange(finalData);
    }
  };

  const handleOtherChange = (e) => {
    const value = e.target.value;
    setOtherValue(value);

    // Clear error when user starts typing
    if (errors.otherValue) {
      setErrors((prev) => ({ ...prev, otherValue: "" }));
    }

    // If "Other" is selected, update the parent with the new value
    if (selectedTypes.includes("Other")) {
      const finalData = {
        businessTypes: selectedTypes,
        otherBusinessType: value,
      };

      if (onSelectionChange) {
        onSelectionChange(finalData);
      }
    }
  };

  const handleOtherCheckbox = () => {
    let updatedTypes;

    if (selectedTypes.includes("Other")) {
      updatedTypes = selectedTypes.filter((type) => type !== "Other");
      setOtherValue(""); // Clear other value when unchecking
    } else {
      updatedTypes = [...selectedTypes, "Other"];
    }

    setSelectedTypes(updatedTypes);

    const finalData = {
      businessTypes: updatedTypes,
      otherBusinessType: updatedTypes.includes("Other") ? otherValue : "",
    };

    if (onSelectionChange) {
      onSelectionChange(finalData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🏢 Business Type
        </h3>
        <p className="text-sm text-gray-600">
          What kind of business do you have? (Select all that apply)
        </p>
      </div>

      {/* Business Type Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {businessTypes.map((type) => (
          <label
            key={type}
            className={`h-max flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTypes.includes(type)
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleCheckboxChange(type)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  selectedTypes.includes(type)
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {selectedTypes.includes(type) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="ml-3 font-medium">{type}</span>
          </label>
        ))}

        {/* Other Option */}
        <div className="space-y-2">
          <label
            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTypes.includes("Other")
                ? "border-purple-500 bg-purple-50 text-purple-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedTypes.includes("Other")}
                onChange={handleOtherCheckbox}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  selectedTypes.includes("Other")
                    ? "border-purple-500 bg-purple-500"
                    : "border-gray-300"
                }`}
              >
                {selectedTypes.includes("Other") && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="ml-3 font-medium">Other</span>
          </label>

          {/* Other Input Field */}
          {selectedTypes.includes("Other") && (
            <div className="ml-8 animate-slideDown">
              <input
                type="text"
                value={otherValue}
                onChange={handleOtherChange}
                placeholder="Please specify your business type"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 ${
                  errors.otherValue
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {errors.otherValue && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span>⚠️</span> {errors.otherValue}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Validation Error */}
      {errors.businessTypes && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm flex items-center gap-1">
            <span>⚠️</span> {errors.businessTypes}
          </p>
        </div>
      )}
    </div>
  );
};

export default BusinessTypeComponent;
