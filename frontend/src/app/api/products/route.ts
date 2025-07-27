// app/api/products/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  const backendURL = category
    ? `http://localhost:3001/api/products?category=${category}`
    : "http://localhost:3001/api/products";

  try {
    const res = await fetch(backendURL);

    if (!res.ok) {
      throw new Error("Failed to fetch products from backend");
    }

    const data = await res.json();
    return NextResponse.json(data.products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// 🆕 POST handler to add new product
// 🆕 Updated POST handler for multipart/form-data (with image upload)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData(); // ✅ handles multipart data

    const res = await fetch("http://localhost:3001/api/products", {
      method: "POST",
      body: formData, // ✅ directly forward the formData
    });

    console.log(formData)

    if (!res.ok) {
      throw new Error("Failed to post product to backend");
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error posting product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
