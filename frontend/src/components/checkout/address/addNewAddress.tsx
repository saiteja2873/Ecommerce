// src/components/checkout/AddNewAddress.tsx
"use client";

import { useState } from "react";
import { Address } from "./addressTypes"; // Assuming this path and type are correct
// import { getSavedAddresses, saveAddresses } from "./utils"; // Assuming these utilities exist
import { motion } from "framer-motion"; // For animations
import { toast } from "react-hot-toast"; // For user feedback

interface Props {
  onAdd: (newAddress: Address) => void;
  onCancel?: () => void; // Optional cancel prop
}

// Glassmorphism helper (consistent with CartPage)
const gradientBg = "bg-transparent";
const Glass = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={
      `${gradientBg} rounded-2xl  border-cyan-500/30 backdrop-blur-lg ` +
      className
    }
    style={{
      backgroundBlendMode: "screen",
    }}
  >
    {children}
  </div>
);

export default function AddNewAddress({ onAdd, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Address, "id">>({
    // Use Omit<Address, 'id'> for form state
    fullName: "", // Changed from 'name' to 'fullName'
    phone: "",
    email: "",
    addressLine1: "", // Changed from 'addressLine'
    addressLine2: "", // Added optional address line
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State for form errors

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    // Added TextAreaElement
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" })); // Clear error on change
  }

  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required.";
    if (!form.phone.trim()) newErrors.phone = "Phone is required.";
    if (!form.addressLine1.trim())
      newErrors.addressLine1 = "Address Line 1 is required.";
    if (!form.city.trim()) newErrors.city = "City is required.";
    if (!form.state.trim()) newErrors.state = "State is required.";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required.";
    if (!form.country.trim()) newErrors.country = "Country is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first.");
        return;
      }

      const res = await fetch("http://localhost:3001/api/address/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok || !data.success) {
        if (data.error === "Address already exists") {
          toast.error("Address already exists.");
        } else {
          toast.error(data.error || "Something went wrong.");
        }
        return;
      }

      toast.success("Address added successfully!");
      onAdd(data.address); // Pass saved address back to parent

      // Clear form
      setForm({
        fullName: "",
        phone: "",
        email : "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
      });
    } catch (error) {
      console.error("Error submitting to backend:", error);
      toast.error("Failed to save address. Please try again.");
    }
  };

  const inputClasses =
    "w-full p-3 rounded-md bg-zinc-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200";
  const labelClasses = "block mb-1 font-medium text-gray-300";
  const errorClasses = "text-red-400 text-sm mt-1";

  return (
    <Glass className="p-6 sm:p-8 space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6">
        Add New Address
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className={labelClasses}>
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Your Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            {errors.fullName && (
              <p className={errorClasses}>{errors.fullName}</p>
            )}
          </div>
          <div>
            <label htmlFor="phone" className={labelClasses}>
              Phone Number
            </label>
            <input
              type="tel" // Use type="tel" for phone numbers
              id="phone"
              name="phone"
              placeholder="e.g., +1234567890"
              value={form.phone}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            {errors.phone && <p className={errorClasses}>{errors.phone}</p>}
          </div>
        </div>

        {/* Email */}

        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="omegon@gmail.com"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClasses}
          />
          {errors.addressLine1 && (
            <p className={errorClasses}>{errors.addressLine1}</p>
          )}
        </div>

        {/* Address Line 1 & 2 */}
        <div>
          <label htmlFor="addressLine1" className={labelClasses}>
            Address Line 1
          </label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            placeholder="Street address, P.O. Box, company name, c/o"
            value={form.addressLine1}
            onChange={handleChange}
            required
            className={inputClasses}
          />
          {errors.addressLine1 && (
            <p className={errorClasses}>{errors.addressLine1}</p>
          )}
        </div>
        <div>
          <label htmlFor="addressLine2" className={labelClasses}>
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            placeholder="Apartment, suite, unit, building, floor, etc."
            value={form.addressLine2}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {/* City, State, Pincode, Country Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className={labelClasses}>
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            {errors.city && <p className={errorClasses}>{errors.city}</p>}
          </div>
          <div>
            <label htmlFor="state" className={labelClasses}>
              State / Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              placeholder="State / Province"
              value={form.state}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            {errors.state && <p className={errorClasses}>{errors.state}</p>}
          </div>
          <div>
            <label htmlFor="pincode" className={labelClasses}>
              Zip / Postal Code
            </label>
            <input
              type="text" // Use text for pincode as it can have non-numeric chars in some countries
              id="pincode"
              name="pincode"
              placeholder="Zip Code"
              value={form.pincode}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            {errors.pincode && <p className={errorClasses}>{errors.pincode}</p>}
          </div>
          <div className="col-span-full sm:col-span-1 lg:col-span-1">
            {" "}
            {/* Ensure proper spanning */}
            <label htmlFor="country" className={labelClasses}>
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              placeholder="Country"
              value={form.country}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            {errors.country && <p className={errorClasses}>{errors.country}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-200"
          >
            Add Address
          </motion.button>
          {onCancel && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </motion.button>
          )}
        </div>
      </form>
    </Glass>
  );
}
