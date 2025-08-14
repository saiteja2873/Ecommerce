"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface PaymentSectionProps {
  amount: number; // INR
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  method?: {
    card?: boolean;
    netbanking?: boolean;
    upi?: boolean;
    wallet?: boolean;
    emi?: boolean;
    paylater?: boolean;
  };
  config?: {
    display?: {
      blocks?: {
        upi?: {
          apps?: string[];
        };
      };
    };
  };
  handler: (response: Record<string, string>) => void;
  modal?: {
    ondismiss?: () => void;
  };
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
}

interface RazorpayInstance {
  on: (
    event: string,
    callback: (response: Record<string, any>) => void
  ) => void;
  open: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({ amount }) => {
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      setIsRazorpayLoaded(false);
      toast.error("Failed to load payment SDK.");
    };
    document.body.appendChild(script);
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isRazorpayLoaded) {
      toast.error("Payment SDK not loaded yet. Please wait.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://ecommerce-j5j0.onrender.com/api/payment/create-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        }
      );

      if (!res.ok) {
        const errorData: { error?: string } = await res.json();
        throw new Error(errorData.error || `Backend error: ${res.status}`);
      }

      const data: { order: any; key_id: string } = await res.json();
      const { order, key_id } = data;

      const options: RazorpayOptions = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Omegon",
        description: "Purchase",
        order_id: order.id,
        method: {
          card: true,
          netbanking: false,
          upi: true,
          wallet: false,
          emi: false,
          paylater: false,
        },
        config: {
          display: {
            blocks: {
              upi: {
                apps: ["googlepay", "phonepe", "paytm"],
              },
            },
          },
        },
        handler: async (response) => {
          toast.success("Payment successful!");

          try {
            const verifyRes = await fetch(
              "https://ecommerce-j5j0.onrender.com/api/payment/verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );

            if (!verifyRes.ok) {
              toast.error("Payment verification failed.");
            } else {
              toast.success("Payment verified successfully!");
            }
          } catch (err: unknown) {
            console.error("Verification error:", err);
            toast.error("Verification request failed.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast("Payment Cancelled.");
          },
        },
        prefill: {
          name: "Raju",
          email: "raju@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        toast.error(
          (response.error && response.error.description) || "Payment failed"
        );
        setLoading(false);
      });

      rzp.open();
    } catch (err: unknown) {
      console.error("Payment error:", err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong during payment.");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handlePayment} className="py-2">
        <h2 className="text-xl font-semibold mb-2 text-white">
          Payment Information
        </h2>
        <p className="text-slate-400 mb-4">
          Click Pay Now to proceed with your payment.
        </p>

        <button
          type="submit"
          disabled={!isRazorpayLoaded || loading}
          className={`w-full ${
            isRazorpayLoaded && !loading
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-500"
          } text-white font-semibold py-2 rounded-lg transition`}
        >
          {isRazorpayLoaded && !loading
            ? `Pay Now ₹${amount}`
            : "Processing..."}
        </button>
      </form>
    </>
  );
};

export default PaymentSection;
