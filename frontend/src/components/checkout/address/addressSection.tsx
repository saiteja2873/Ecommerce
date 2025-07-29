// src/components/checkout/AddressSection.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import AddressCard from "./addressCard";
import EditAddressForm from "./editAddressForm";
import { Address } from "./addressTypes";
import AddNewAddress from "./addNewAddress";
import { getSavedAddresses, saveAddresses } from "./utils";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";
import { Plus, MapPin } from "lucide-react";

const gradientBg =
  "bg-gradient-to-br from-indigo-90 via-cyan-800/80 to-purple-900/60";
const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={
      `${gradientBg} rounded-2xl shadow-xl border border-cyan-500/30 backdrop-blur-lg ` +
      className
    }
    style={{
      backgroundBlendMode: "screen",
    }}
  >
    {children}
  </div>
);

export default function AddressSection({ onHeightChange }: { onHeightChange?: () => void }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const loadedAddresses = getSavedAddresses();
    setAddresses(loadedAddresses);
    if (loadedAddresses.length > 0) {
      setSelectedId(loadedAddresses[0].id);
    }
  }, []);

  useEffect(() => {
    saveAddresses(addresses);
  }, [addresses]);

  const handleSelect = (id: string) => setSelectedId(id);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(false);
    onHeightChange?.();
  };

  const handleSave = (updated: Address) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === updated.id ? updated : addr))
    );
    setEditingAddress(null);
  };

  const handleAdd = (newAddress: Address) => {
    setAddresses((prev) => [...prev, newAddress]);
    setSelectedId(newAddress.id);
    setShowAddForm(false);
  };

  const triggerAddForm = () => {
    setShowAddForm(true);
    setEditingAddress(null);
    onHeightChange?.();
  };

  const formVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 } as Transition,
    },
    exit: { opacity: 0, y: -50, scale: 0.9, transition: { duration: 0.2 } as Transition },
  };

  return (
    <section className="bg-transparent text-white py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-extrabold text-3xl sm:text-4xl text-center mb-6 flex items-center justify-center gap-3 bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-indigo-400 text-transparent bg-clip-text drop-shadow-[0_3px_8px_rgba(80,220,255,0.25)]"
        >
          <MapPin className="w-8 h-8 text-cyan-400 filter drop-shadow" />
          Delivery Address
        </motion.h2>

        <AnimatePresence mode="wait">
          {editingAddress ? (
            <motion.div key="edit-form" variants={formVariants} initial="initial" animate="animate" exit="exit">
              <Glass className="p-6 sm:p-8">
                <EditAddressForm
                  address={editingAddress}
                  onCancel={() => setEditingAddress(null)}
                  onSave={handleSave}
                />
              </Glass>
            </motion.div>
          ) : showAddForm ? (
            <motion.div key="add-form" variants={formVariants} initial="initial" animate="animate" exit="exit">
              <Glass className="p-6 sm:p-8">
                <AddNewAddress
                  onAdd={handleAdd}
                  onCancel={() => setShowAddForm(false)}
                />
              </Glass>
            </motion.div>
          ) : (
            <motion.div key="address-list" variants={formVariants} initial="initial" animate="animate" exit="exit">
              <Glass className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Select a Delivery Address</h3>
                {addresses.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p className="mb-4">No addresses saved yet.</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={triggerAddForm}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 gap-2"
                    >
                      <Plus className="w-5 h-5" /> Add Your First Address
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((addr) => (
                        <AddressCard
                          key={addr.id}
                          address={addr}
                          isSelected={selectedId === addr.id}
                          onSelect={() => handleSelect(addr.id)}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>

                    <div className="mt-8 text-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={triggerAddForm}
                        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-all duration-200 gap-2"
                      >
                        <Plus className="w-5 h-5" /> Add New Address
                      </motion.button>
                    </div>
                  </>
                )}
              </Glass>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
