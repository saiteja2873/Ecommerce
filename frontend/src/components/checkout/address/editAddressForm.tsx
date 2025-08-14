"use client";

import { useState, useEffect } from "react";
import { Address } from "./addressTypes";

interface EditAddressFormProps {
  address: Address;
  onCancel: () => void;
  onSave: (updatedAddress: Address) => void;
}

export default function EditAddressForm({
  address,
  onCancel,
  onSave,
}: EditAddressFormProps) {
  const [form, setForm] = useState<Address>(address);

  useEffect(() => {
    setForm(address); // Reset form if address changes
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "https://ecommerce-j5j0.onrender.com/api/address/update/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // if you're using auth
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update address");
      }

      onSave(result.address); // Notify parent with updated address
    } catch (error) {
      console.error("Error updating address:", error);
      alert("Failed to update address. Please try again.");
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-900 shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-white">Edit Address</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />


          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
        <input
          type="text"
          name="addressLine1"
          placeholder="Address Line 1"
          value={form.addressLine1}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="text"
          name="addressLine2"
          placeholder="Address Line 2"
          value={form.addressLine2 || ""}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />
        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          required
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-md text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded-md"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
