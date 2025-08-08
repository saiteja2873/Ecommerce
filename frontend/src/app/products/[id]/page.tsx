"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useLoaderStore } from "@/context/loaderStore";
import toast from "react-hot-toast";
import { useAuthStatus } from "@/hooks/useAuthStatus"; // adjust path if needed
// import ProductGrid from "@/components/product/productGrid";



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
  image: string; // Transformed thumbnail for ProductGrid
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStatus(); // outside the function
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const [product, setProduct] = useState<Product | null>(null);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isProductDetailsView, setIsProductDetailsView] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantLabel, setSelectedVariantLabel] = useState<
    string | null
  >(null);
  const { addToCart, cartItems } = useCart(); // ✅ Get cartItems from useCart
  const { setLoading } = useLoaderStore();
  const [error, setError] = useState<string | null>(null);

  const fetchProductOrProducts = useCallback(async () => {
    setLoading(true, 0);
    setError(null);

    try {
      if (id && typeof id === "string" && !query) {
        const res = await fetch(`http://localhost:3001/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.product) {
            setProduct(data.product);
            setSelectedImage(data.product.thumbnail);
            if (
              data.product.variantStock &&
              data.product.variantStock.length > 0
            ) {
              setSelectedVariantLabel(data.product.variantStock[0].label);
            }
            setIsProductDetailsView(true);
            return;
          }
        }
        console.warn(
          `Product ID "${id}" not found or error. Falling back to search list.`
        );
      }

      setIsProductDetailsView(false);
      const searchQuery = query || (typeof id === "string" ? id : "");

      if (!searchQuery) {
        setProductsList([]);
        return;
      }

      const resList = await fetch(
        `http://localhost:3001/api/products/search?query=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (!resList.ok) {
        const errorText = await resList.text();
        console.error(
          `Failed to fetch product list: ${String(
            resList.status
          )} - ${errorText}`
        );
        throw new Error(
          `Failed to fetch products: ${resList.status} - ${errorText}`
        );
      }
      const dataList = await resList.json();
      setProductsList(dataList.products || []);
    } catch (fetchError) {
      console.error("Error fetching product or products list:", fetchError);
      setError("Failed to load product information. Please try again.");
      toast.error(
        "An unexpected error occurred while loading product information."
      );
    } finally {
      setLoading(false, 500);
    }
  }, [id, query, router, setLoading]);

  useEffect(() => {
    fetchProductOrProducts();
  }, [fetchProductOrProducts]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
  //       Loading product information...
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-red-500 text-lg">
        {error}
      </div>
    );
  }

  if (isProductDetailsView && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-gray-400 text-lg">
        Product not found.
      </div>
    );
  }

  // --- Render Product Details View ---
  if (isProductDetailsView && product) {
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
      currentVariantStock <= 0;

    // ✅ Get existing quantity of this specific item/variant in the cart
    const cartItemId = `${product.id}-${selectedVariantLabel ?? "default"}`;
    const existingCartItem = cartItems.find((item) => item.id === cartItemId);
    const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;

    // ✅ Determine if adding 'quantity' would exceed total stock
    const wouldExceedStock = quantity + quantityInCart > currentVariantStock;
    const isMaxedOutInCart =
      quantityInCart >= currentVariantStock && currentVariantStock > 0;

    const handleAddToCart = (
      e?: React.MouseEvent<HTMLButtonElement>
    ): boolean => {
      e?.preventDefault();

      if (!isAuthenticated) {
        toast.error("You must be logged in to add to cart.");
        router.push("/account/login"); // or "/auth/login" if that's your route
        return false;
      }

      if (
        product.variantStock &&
        product.variantStock.length > 0 &&
        !selectedVariantLabel
      ) {
        toast.error("Please select a variant.");
        return false;
      }

      if (quantity <= 0) {
        toast.error("Quantity must be at least 1.");
        return false;
      }

      if (wouldExceedStock && currentVariantStock > 0) {
        toast.error(
          `Adding ${quantity} would exceed available stock. Only ${
            currentVariantStock - quantityInCart
          } more can be added.`
        );
        return false;
      }

      if (
        currentVariantStock <= 0 &&
        product.variantStock &&
        product.variantStock.length > 0
      ) {
        toast.error("This variant is currently out of stock.");
        return false;
      }

      const variantInfo = selectedVariantLabel
        ? ` (${selectedVariantLabel})`
        : "";
      const cartItem = {
        id: cartItemId,
        name: `${product.name}${variantInfo}`,
        price: product.price,
        imageUrl: product.thumbnail,
        variant: selectedVariantLabel ?? "default",
        quantity: quantity,
        stock: currentVariantStock,
      };

      const addedSuccessfully = addToCart(cartItem);

      if (addedSuccessfully) {
        setQuantity(1);
      }

      return addedSuccessfully;
    };

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
        setQuantity(0);
      } else {
        const parsedValue = parseInt(value, 10);
        if (!isNaN(parsedValue) && parsedValue >= 0) {
          setQuantity(parsedValue);
        }
      }
    };

    return (
      <div className="bg-zinc-900 min-h-screen text-white overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Image section */}
            <div className="flex flex-col gap-4 sticky top-10 md:top-12 ">
              <div className="relative w-full aspect-square border border-gray-700 rounded-xl overflow-hidden bg-zinc-800 shadow-xl">
                <Image
                  src={selectedImage || "/images/fallback.png"}
                  alt={product.name}
                  fill
                  className="object-contain object-top"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 50vw"
                  priority
                />
              </div>

              {/* Thumbnail selector */}
              {product.images && product.images.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-zinc-800">
                  {product.images.map((img, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 relative border rounded-md cursor-pointer transition-all duration-200 ${
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
                {/* ✅ NEW: Display total quantity in cart for this variant */}
                {selectedVariantLabel && quantityInCart > 0 && (
                  <p className="mt-1 text-sm text-slate-500 flex items-center gap-1">
                    <span className="font-semibold text-slate-600">
                      {quantityInCart}
                    </span>{" "}
                    in cart
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    isOutOfStock ||
                    quantity === 0 ||
                    (product.variantStock && !selectedVariantLabel) ||
                    isMaxedOutInCart ||
                    quantity > currentVariantStock - quantityInCart
                  }
                >
                  Add to Cart
                </button>
                <button
                  onClick={(e) => {
                    handleAddToCart(e);
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
                    (product.variantStock && !selectedVariantLabel) ||
                    isMaxedOutInCart ||
                    quantity > currentVariantStock - quantityInCart
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
}
