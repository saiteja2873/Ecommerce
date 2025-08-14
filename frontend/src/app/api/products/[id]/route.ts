// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // ✅ Extract the dynamic route param without using the 2nd argument
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop(); // last segment

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    const backendRes = await fetch(
      `https://ecommerce-j5j0.onrender.com/api/products/${encodeURIComponent(id)}`
    );

    if (!backendRes.ok) {
      throw new Error("Failed to fetch product from backend");
    }

    const data = await backendRes.json();
    return NextResponse.json(data.product); // or just `data`
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
