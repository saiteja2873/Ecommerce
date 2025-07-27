// app/AddProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // Assuming react-toastify is set up

const categories = [
  { id: "6884acf495859d3fdb7141ae", title: "Mens" },
  { id: "6884ad4795859d3fdb7141af", title: "Womens" },
  { id: "6884ad7695859d3fdb7141b0", title: "Sweets" },
  { id: "6884ada595859d3fdb7141b1", title: "Pickles" },
];

const AddProductForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "", // This will be updated by AI
    categoryId: "",
    brand: "",
    color: "",
    discount: "",
    tags: "",
    isFeatured: false,
  });

  const [variants, setVariants] = useState([{ label: "", quantity: "" }]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const [images, setImages] = useState<(File | null)[]>([]);
  const [imageInputs, setImageInputs] = useState<number[]>([0]);

  const [aiDescriptionPrompt, setAiDescriptionPrompt] = useState("");
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [aiDescriptionError, setAiDescriptionError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleVariantChange = (
    index: number,
    field: "label" | "quantity",
    value: string
  ) => {
    const updated = [...variants];
    if (field === "quantity") {
      const parsedQuantity = parseInt(value, 10);
      if (value === "" || (!isNaN(parsedQuantity) && parsedQuantity >= 0)) {
        updated[index][field] = value;
      }
    } else {
      updated[index][field] = value;
    }
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { label: "", quantity: "" }]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    inputIndex: number
  ) => {
    const file = e.target.files ? e.target.files[0] : null;

    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages[inputIndex] = file;
      return newImages;
    });
  };

  const addImageInput = () => {
    const newKey = imageInputs.length > 0 ? Math.max(...imageInputs) + 1 : 0;
    setImageInputs((prev) => [...prev, newKey]);
    setImages((prev) => [...prev, null]);
  };

  const removeImageInput = (indexToRemove: number) => {
    setImageInputs((prev) => prev.filter((_, i) => i !== indexToRemove));
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const generateDescription = async () => {
    if (!formData.name.trim()) {
      setAiDescriptionError("Please enter a Product Name first.");
      return;
    }
    if (!aiDescriptionPrompt.trim()) {
      setAiDescriptionError(
        "Please provide some keywords or a brief description for the AI."
      );
      return;
    }

    setIsGeneratingDescription(true);
    setAiDescriptionError("");

    try {
      const prompt = `Generate a compelling and concise product description for a product named "${formData.name}", color "${formData.color}, brand : "${formData.brand}". Use these keywords/brief description: "${aiDescriptionPrompt}". Focus on features, benefits, and appeal to customers. Keep it under 30 words in a concise way for marketing.`;

      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log("Gemini API raw response result:", result);
      console.log("Gemini API response status:", response.status);

      if (response.status === 403) {
        setAiDescriptionError(
          "API Key error: Permission denied. Check your API key and its restrictions."
        );
        console.error("API Key Error:", result.error);
        return;
      }
      if (result.error) {
        setAiDescriptionError(
          `API Error: ${result.error.message || "Unknown error"}`
        );
        console.error("Gemini API Error Details:", result.error);
        return;
      }

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const generatedText = result.candidates[0].content.parts[0].text;
        setFormData((prev) => ({ ...prev, description: generatedText }));
        toast.success("Description generated successfully!");
      } else {
        setAiDescriptionError(
          "Failed to generate description. No candidates returned."
        );
        console.error("Gemini API response structure unexpected:", result);
      }
    } catch (error) {
      setAiDescriptionError("An error occurred during description generation.");
      console.error("Error calling Gemini API:", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, String(value));
    });

    if (!thumbnail) {
      toast.error("Thumbnail image is required.");
      return;
    }
    form.append("images", thumbnail);

    images.filter(Boolean).forEach((file) => {
      form.append("images", file as File);
    });

    const validVariants = variants.filter(
      (v) => v.label.trim() !== "" && v.quantity.trim() !== ""
    );
    form.append("variants", JSON.stringify(validVariants));

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add product");
      }

      toast.success("Product added successfully!");
      router.push("/account/admin/dashboard");
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    // Outer container to make the form fill the page
    <div className="min-h-screen bg-zinc-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        // Max width for the form, centered, with padding
        className="max-w-4xl mx-auto p-6 md:p-8 bg-zinc-800 rounded-lg shadow-xl space-y-6"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Add New Product</h2>

        {/* Grid for main product info - 2 columns on medium screens, 3 on large */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Product Name (small, but fits in grid) */}
          <div className="col-span-1">
            <label htmlFor="name" className="block mb-1 font-medium">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price */}
          <div className="col-span-1">
            <label htmlFor="price" className="block mb-1 font-medium">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div className="col-span-1">
            <label htmlFor="categoryId" className="block mb-1 font-medium">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
            {formData.categoryId && (
              <div className="text-sm text-gray-400 mt-1">
                Selected ID:{" "}
                <span className="font-mono">{formData.categoryId}</span>
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="col-span-1">
            <label htmlFor="brand" className="block mb-1 font-medium">
              Brand
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color */}
          <div className="col-span-1">
            <label htmlFor="color" className="block mb-1 font-medium">
              Color
            </label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Discount */}
          <div className="col-span-1">
            <label htmlFor="discount" className="block mb-1 font-medium">
              Discount (%)
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              step="0.1"
              value={formData.discount}
              onChange={handleChange}
              className="w-full p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div className="col-span-1">
            <label htmlFor="tags" className="block mb-1 font-medium">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="col-span-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isFeatured" className="font-medium">
              Mark as Featured
            </label>
          </div>
        </div>

        {/* Description (occupies full row) */}
        <div className="col-span-full">
          {" "}
          {/* This needs to be outside the grid or span all columns */}
          <label htmlFor="description" className="block mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
          ></textarea>
        </div>

        {/* AI Description Generator Section (occupies full row) */}
        <div className="col-span-full bg-gray-800 p-4 rounded-lg shadow-inner space-y-3">
          {" "}
          {/* Span full */}
          <h3 className="text-lg font-semibold text-white">
            Generate Description with AI
          </h3>
          <p className="text-sm text-gray-300">
            Provide keywords or a brief idea, then click "Generate".
          </p>
          <div>
            <label htmlFor="aiDescriptionPrompt" className="sr-only">
              AI Description Prompt
            </label>
            <input
              type="text"
              id="aiDescriptionPrompt"
              placeholder="e.g., durable, stylish, for outdoor use, made of cotton"
              value={aiDescriptionPrompt}
              onChange={(e) => setAiDescriptionPrompt(e.target.value)}
              className="w-full p-2 rounded bg-black border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGeneratingDescription}
            />
          </div>
          <button
            type="button"
            onClick={generateDescription}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 transition p-2 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isGeneratingDescription ||
              !formData.name.trim() ||
              !aiDescriptionPrompt.trim()
            }
          >
            {isGeneratingDescription
              ? "Generating..."
              : "Generate Description ✨"}
          </button>
          {aiDescriptionError && (
            <p className="text-red-400 text-sm mt-2">{aiDescriptionError}</p>
          )}
        </div>

        {/* Thumbnail Image */}
        <div className="col-span-full md:col-span-1">
          {" "}
          {/* Span full on small, 1 on md+ */}
          <label htmlFor="thumbnail" className="block mb-1 font-medium">
            Thumbnail Image (Main Image)
          </label>
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
            className="w-full p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* More Images Section */}
        <div className="col-span-full md:col-span-2">
          {" "}
          {/* Span full on small, 2 on md+ */}
          <label className="block mb-1 font-medium">More Images</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {" "}
            {/* Nested grid for multiple image inputs */}
            {imageInputs.map((key, index) => (
              <div key={key} className="flex gap-2 mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  className="flex-1 p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeImageInput(index)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove image input"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addImageInput}
            className="px-3 py-1 text-sm font-bold text-black bg-white border rounded hover:bg-gray-100 mt-2"
          >
            + Add More
          </button>
        </div>

        {/* Variants Section */}
        <div className="col-span-full">
          {" "}
          {/* Span full */}
          <label className="block mb-1 font-medium">Variants</label>
          <div className="space-y-3">
            {" "}
            {/* Use space-y for vertical gap between variant rows */}
            {variants.map((variant, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-2">
                {" "}
                {/* Flex-col on small, flex-row on sm+ */}
                <input
                  type="text"
                  placeholder="Label (e.g. 1kg, M)"
                  value={variant.label}
                  onChange={(e) =>
                    handleVariantChange(idx, "label", e.target.value)
                  }
                  className="flex-1 p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={variant.quantity}
                  onChange={(e) =>
                    handleVariantChange(idx, "quantity", e.target.value)
                  }
                  className="w-24 p-2 rounded bg-black border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  className="text-red-500 hover:text-red-700"
                  title="Remove variant"
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="text-sm text-blue-400 hover:underline mt-2"
          >
            + Add Variant
          </button>
        </div>

        <button
          type="submit"
          className="col-span-full w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded font-semibold text-xl"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
