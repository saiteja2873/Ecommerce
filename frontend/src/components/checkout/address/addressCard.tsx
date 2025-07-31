"use client";

import { Address } from "./addressTypes";
import { motion } from "framer-motion";
import { CheckCircle, Edit, MapPin, Phone } from "lucide-react";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const gradientBg =
  "bg-gradient-to-br from-indigo-900/70 via-cyan-800/80 to-purple-900/60";

const Glass = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`${gradientBg} rounded-xl shadow-md border border-cyan-500/30 backdrop-blur-md ${className}`}
    style={{ backgroundBlendMode: "screen" }}
  >
    {children}
  </div>
);

export default function AddressCard({
  address,
  onEdit,
  isSelected,
  onSelect,
}: AddressCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  const handleEditClick = (
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    onEdit(address);
  };

  return (
    <motion.div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      className={`relative overflow-hidden cursor-pointer transition-all duration-200 ease-in-out p-2 rounded-xl
        ${isSelected
          ? "border-emerald-400 ring-2 ring-emerald-400 shadow-md shadow-emerald-500/20 scale-[1.005]"
          : "border-gray-700 hover:border-blue-500"
        }
        outline-none focus-visible:ring-2 focus-visible:ring-blue-400
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <Glass className="p-3 flex flex-col gap-3">
        {/* Top Row */}
        <div className="flex justify-between items-center">
          {isSelected ? (
            <motion.div
              initial={false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center gap-1 text-emerald-400 font-semibold text-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Selected</span>
            </motion.div>
          ) : (
            <div className="w-[75px]" />
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            type="button"
            onClick={handleEditClick}
            onKeyDown={(e) => e.stopPropagation()}
            aria-label={`Edit address for ${address.fullName}`}
            className="text-cyan-400 hover:text-cyan-200 hover:bg-cyan-900/30 rounded px-2 py-0.5 text-xs flex items-center gap-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-300"
          >
            <Edit className="w-3.5 h-3.5" /> Edit
          </motion.button>
        </div>

        {/* Address Details */}
        <div className="text-gray-200 space-y-2">
          <h3 className="font-semibold text-base text-white">{address.fullName}</h3>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-fuchsia-400 mt-0.5" />
            <p className="text-xs leading-snug">
              {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
              <br />
              {address.city} - {address.pincode}
              <br />
              {address.state}, {address.country}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs">{address.phone}</p>
          </div>
        </div>
      </Glass>
    </motion.div>
  );
}
