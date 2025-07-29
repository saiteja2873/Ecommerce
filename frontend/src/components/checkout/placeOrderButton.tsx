"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx"; // Optional but useful for conditional classes

interface PlaceOrderButtonProps {
  className?: string;
}

export default function PlaceOrderButton({ className }: PlaceOrderButtonProps) {
  const router = useRouter();

  const handleOrder = () => {
    // TODO: Validate + send order data
    router.push("/payment/gateway");
  };

  return (
    <button
      type="button"
      onClick={handleOrder}
      className={clsx(
        "w-full bg-black text-white py-2 rounded hover:bg-gray-800",
        className
      )}
    >
      Place Order
    </button>
  );
}
