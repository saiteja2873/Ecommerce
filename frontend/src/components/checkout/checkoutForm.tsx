"use client";

import { useRef, useState } from "react";
import AddressSection from "./address/addressSection";
import PlaceOrderButton from "./placeOrderButton";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Truck, ListChecks, CreditCard } from "lucide-react";
import ReviewOrderSection from "./reviewOrderSection";
import PaymentSection from "../payment/paymentSection";
import { usePaymentContext } from "@/context/paymentContext"; // ✅ import context

const steps = [
  { number: 1, label: "Shipping", icon: <Truck size={18} /> },
  { number: 2, label: "Review Order", icon: <ListChecks size={18} /> },
  { number: 3, label: "Payment", icon: <CreditCard size={18} /> },
];

const stepContentVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.35 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function CheckoutForm() {
  const [step, setStep] = useState(1);
  const totalSteps = steps.length;

  const { paymentAmount } = usePaymentContext(); // ✅ Get the stored amount

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const footerRef = useRef<HTMLDivElement | null>(null);

  const handleAddressHeightChange = () => {
    setTimeout(() => {
      footerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  return (
    <div className="flex justify-center bg-gradient-to-b from-black to-purple-950 py-8 px-3">
      <main className="w-full max-w-2xl mx-auto rounded-xl border border-slate-500 shadow-lg p-6 sm:p-8 backdrop-blur-3xl bg-transparent flex flex-col min-h-[80vh]">
        <header className="mb-6">
          <h1 className="font-bold text-3xl text-white text-center tracking-tight">
            Checkout
          </h1>

          {/* Step Tracker */}
          <nav className="mt-6 flex items-center justify-between gap-6 relative">
            {steps.map((s) => (
              <div
                key={s.number}
                className="flex flex-col items-center flex-1 min-w-0 z-10"
              >
                <div
                  className={`flex items-center justify-center rounded-full w-9 h-9 border-2 transition-all
                    ${
                      step === s.number
                        ? "border-blue-600 bg-blue-600 text-white"
                        : step > s.number
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-slate-100 text-slate-400"
                    }`}
                >
                  {s.icon}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center truncate
                    ${step === s.number ? "text-blue-700" : "text-slate-400"}`}
                >
                  {s.label}
                </span>
              </div>
            ))}
            <div className="absolute left-[5%] right-[5%] top-1/3 -translate-y-1/2 h-1 bg-slate-200 z-0 rounded">
              <motion.div
                className="h-full bg-blue-500 rounded"
                initial={false}
                animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                transition={{ duration: 0.4, type: "tween" }}
              />
            </div>
          </nav>
        </header>

        {/* Step Content */}
        <section className="flex-grow mb-4 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="shipping"
                variants={stepContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AddressSection onHeightChange={handleAddressHeightChange} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="order"
                variants={stepContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="py-2"
              >
                <ReviewOrderSection />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="payment"
                variants={stepContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="py-2"
              >
                <PaymentSection amount={paymentAmount} />{" "}
                {/* ✅ Use actual amount */}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Sticky Footer */}
        <footer
          ref={footerRef}
          className="flex justify-between items-center gap-3 pt-4 mt-auto sticky bottom-16 sm:bottom-14 lg:bottom-2 bg-transparent backdrop-blur-lg"
        >
          {step > 1 ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={prevStep}
              className="px-5 py-2 rounded-md border border-slate-300 bg-white text-slate-600 font-semibold hover:bg-slate-100 transition"
            >
              Back
            </motion.button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={nextStep}
              className="px-7 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 font-semibold shadow transition focus:outline-none"
            >
              Next
            </motion.button>
          ) : (
            <PlaceOrderButton className="ml-auto px-7 py-2 rounded-md text-white bg-emerald-600 hover:bg-emerald-700 font-semibold shadow transition focus:outline-none" />
          )}
        </footer>
      </main>
    </div>
  );
}
