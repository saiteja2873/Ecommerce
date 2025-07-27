// app/products/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useLoaderStore } from "@/context/loaderStore";
import toast from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  thumbnail: string;
  images: string[];
  description?: string;
  categoryId: string;
  category: { id: string; title: string; slug: string };
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  isActive: boolean;
  isDeleted: boolean;
  variantStock?: Array<{ id: string; label: string; quantity: number }>;
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantLabel, setSelectedVariantLabel] = useState<
    string | null
  >(null);
  const { addToCart } = useCart();
  const { setLoading } = useLoaderStore();

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true, 0);
      if (typeof id !== "string") {
        toast.error("Invalid product ID.");
        router.push("/404");
        return;
      }

      const res = await fetch(`http://localhost:3001/api/products/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Product not found.");
          router.push("/products");
        } else {
          toast.error("Failed to fetch product details.");
        }
        return;
      }
      const data = await res.json();
      if (data?.product) {
        setProduct(data.product);
        setSelectedImage(
          `http://localhost:3001${
            data.product.images?.[0] || data.product.thumbnail
          }`
        );
        console.log("Frontend product state after fetch:", data.product); // ✅ ADD THIS

        if (data.product.variantStock && data.product.variantStock.length > 0) {
          setSelectedVariantLabel(data.product.variantStock[0].label);
        }
      } else {
        toast.error("Product data is incomplete or malformed.");
        router.push("/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error(
        "An unexpected error occurred while loading product details."
      );
    } finally {
      setLoading(false, 500);
    }
  }, [id, router, setLoading]);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id, fetchProduct]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        Loading product details...
      </div>
    );
  }

  const selectedVariantObject = product.variantStock?.find(
    (v) => v.label === selectedVariantLabel
  );
  const currentVariantStock =
    selectedVariantObject?.quantity && selectedVariantObject.quantity > 0
      ? selectedVariantObject.quantity
      : 0;
  const isOutOfStock =
    product.variantStock &&
    product.variantStock.length > 0 &&
    currentVariantStock <= 0; // Treat 0 or less as out of stock

  const handleAddToCart = () => {
    if (
      product.variantStock &&
      product.variantStock.length > 0 &&
      !selectedVariantLabel
    ) {
      toast.error("Please select a variant.");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    if (
      product.variantStock &&
      product.variantStock.length > 0 &&
      quantity > currentVariantStock &&
      currentVariantStock > 0
    ) {
      toast.error(
        `Only ${currentVariantStock} items of this variant are available.`
      );
      return; // Prevent adding to cart if quantity exceeds stock
    }

    const variantInfo = selectedVariantLabel
      ? ` (${selectedVariantLabel})`
      : "";
    addToCart({
      id: product.id,
      name: `${product.name}${variantInfo}`,
      price: product.price,
      imageUrl: `http://localhost:3001${product.thumbnail}`,
    });
    toast.success(`${quantity} x ${product.name}${variantInfo} added to cart!`);
    setQuantity(1);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity(0);
    } else {
      const parsedValue = parseInt(value, 10); // Ensure base-10 parsing
      if (!isNaN(parsedValue) && parsedValue >= 0) {
        // const maxAllowed = currentVariantStock > 0 ? currentVariantStock : 999;
        setQuantity(parsedValue);
      }
    }
  };

  return (
    <div className="bg-zinc-900 min-h-screen text-white overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Image section */}
          <div className="flex flex-col gap-4 sticky top-10 md:top-12">
            <div className="relative w-full aspect-square border border-gray-700 rounded-xl overflow-hidden bg-zinc-800 shadow-xl">
              <Image
                src={selectedImage || "/images/fallback.png"}
                alt={product.name}
                fill
                className="object-contain object-top"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Thumbnail selector */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-zinc-800">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 sm:w-28 sm:h-28 relative border rounded-md cursor-pointer transition-all duration-200 ${
                      selectedImage === `http://localhost:3001${img}`
                        ? "border-blue-400 ring-2 ring-blue-400"
                        : "border-gray-700 hover:border-gray-500"
                    }`}
                    onClick={() =>
                      setSelectedImage(`http://localhost:3001${img}`)
                    }
                  >
                    <Image
                      src={`http://localhost:3001${img}`}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover object-top rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6 mt-2">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              {product.name}
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed tracking-wide">
              {product.description || "No description available."}
            </p>

            <div className="text-3xl font-bold text-green-400">
              ₹{product.price.toFixed(2)}
            </div>

            {/* Variant Selection */}
            {product.variantStock && product.variantStock.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2 text-white">
                  Select Variant:
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variantStock.map((variant) => (
                    <button
                      key={variant.label}
                      onClick={() => {
                        if (variant.quantity > 0) {
                          setSelectedVariantLabel(variant.label);
                          setQuantity(1);
                        }
                      }}
                      className={`px-5 py-2 rounded-full border-2 transition-all duration-200
                      ${
                        selectedVariantLabel === variant.label
                          ? "bg-blue-600 border-blue-600 text-white shadow-md"
                          : "bg-zinc-800 border-gray-700 text-gray-300 hover:bg-zinc-700"
                      }
                      ${
                        variant.quantity <= 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    `}
                      disabled={variant.quantity <= 0}
                    >
                      {variant.label}
                      {variant.quantity <= 0 && (
                        <span className="ml-1 text-xs">(Out of Stock)</span>
                      )}
                    </button>
                  ))}
                </div>
                {selectedVariantLabel &&
                  currentVariantStock <= 2 &&
                  currentVariantStock > 0 && (
                    <p className="text-red-400 text-sm mt-2">
                      Only {currentVariantStock}{" "}
                      {currentVariantStock === 1 ? "item" : "items"} left!
                    </p>
                  )}
                {selectedVariantLabel && currentVariantStock === 0 && (
                  <p className="text-red-400 text-sm mt-2">
                    This variant is currently out of stock.
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-4">
              <label
                htmlFor="quantity"
                className="block text-lg font-medium mb-2 text-white"
              >
                Quantity:
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity === 0 ? "" : String(quantity)}
                onChange={handleQuantityChange}
                // max={
                //   currentVariantStock > 0
                //     ? currentVariantStock
                //     : product.variantStock?.length === 0
                //     ? 999
                //     : 1
                // }
                className="w-24 p-2 rounded-md bg-zinc-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isOutOfStock}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleAddToCart}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isOutOfStock ||
                  quantity === 0 ||
                  (product.variantStock && !selectedVariantLabel)
                }
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  if (
                    !isOutOfStock &&
                    quantity > 0 &&
                    !(product.variantStock && !selectedVariantLabel)
                  ) {
                    router.push("/checkout");
                  }
                }}
                className="w-full sm:w-auto px-8 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isOutOfStock ||
                  quantity === 0 ||
                  (product.variantStock && !selectedVariantLabel)
                }
              >
                Buy Now
              </button>
            </div>

            {/* Details Section */}
            <div className="border-t border-gray-700 pt-6 mt-6">
              <h3 className="text-xl font-medium mb-4 text-white">
                Product Details
              </h3>
              <ul className="text-gray-400 space-y-2 text-sm sm:text-base">
                {/* Category */}
                <li>
                  <span className="font-semibold text-white">Category:</span>{" "}
                  <Link
                    href={`/categories/${product.category?.slug}`}
                    className="text-blue-400 hover:underline"
                  >
                    {product.category?.title}
                  </Link>
                </li>

                {/* SKU (optional) */}
                {/* {product.sku && (
                <li>
                  <span className="font-semibold text-white">SKU:</span>{" "}
                  {product.sku}
                </li>
              )} */}

                {/* Featured badge */}
                {product.isFeatured && (
                  <li>
                    <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-purple-600 text-white">
                      🌟 Featured Product
                    </span>
                  </li>
                )}

                {/* Active badge */}
                {product.isActive && (
                  <li>
                    <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-green-600 text-white">
                      ✅ Actively Selling
                    </span>
                  </li>
                )}

                {/* Created At (only show if featured or active) */}
                {/* {(product.isFeatured || product.isActive) && (
                <li>
                  <span className="font-semibold text-white">Listed On:</span>{" "}
                  {new Date(product.createdAt).toLocaleDateString()}
                </li>
              )} */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
