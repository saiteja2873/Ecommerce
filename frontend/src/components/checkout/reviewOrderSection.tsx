import React from "react";
import { useCartContext } from "@/context/cartContext";
import Image from "next/image";

const ReviewOrder: React.FC = () => {
  const { cartItems } = useCartContext();

  // Get selected items from localStorage
  const storedSelected: string[] = JSON.parse(
    localStorage.getItem("selectedItems") || "[]"
  );

  // Filter selected items
  const selectedCartItems = cartItems.filter((item) =>
    storedSelected.includes(
      item.id.includes("-")
        ? item.id
        : `${item.id}-${item.variant ?? "default"}`
    )
  );

  const getImageSrc = (path?: string) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${path}`;
  };

  // Calculate totals
  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 1000 ? 0 : 99; // Example: free shipping over ₹1000
  const totalPrice = subtotal + shipping;

  const formatPrice = (price: number) =>
    price.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col min-h-screen">
      {/* Cart Items */}
      <section className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800">
          Review Your Order
        </h1>

        {selectedCartItems.length > 0 ? (
          <div className="space-y-4 sm:space-y-5">
            {selectedCartItems.map((item) => (
              <article
                key={`${item.id}-${item.variant ?? "default"}`}
                className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative w-full sm:w-28 h-40 sm:h-28 flex-shrink-0">
                  <Image
                    src={getImageSrc(item.imageUrl)}
                    alt={item.name}
                    fill
                    className="object-cover object-top rounded-xl border"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Variant: {item.variant ?? "Default"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 sm:mt-0">
                    Quantity:{" "}
                    <span className="font-medium">{item.quantity}</span>
                  </p>
                </div>

                {/* Price */}
                <div className="flex flex-row sm:flex-col items-end justify-between text-right mt-2 sm:mt-0">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatPrice(item.price)} each
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-16 text-center">
            No items selected for review.
          </p>
        )}
      </section>

      {/* Order Summary at the bottom */}
      {selectedCartItems.length > 0 && (
        <aside className="bg-white border border-gray-100 rounded-2xl shadow-md p-5 sm:p-6 mt-8">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">
            Order Summary
          </h2>

          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>Items ({selectedCartItems.length})</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4 mt-4 text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>

          {/* <button className="mt-6 w-full bg-black text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition">
            Proceed to Payment
          </button> */}
        </aside>
      )}
    </div>
  );
};

export default ReviewOrder;
