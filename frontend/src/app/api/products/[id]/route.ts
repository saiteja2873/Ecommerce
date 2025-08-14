// app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendRes = await fetch(`https://ecommerce-j5j0.onrender.com/api/products/${params.id}`);

    if (!backendRes.ok) {
      throw new Error("Failed to fetch product from backend");
    }

    const data = await backendRes.json();
    return NextResponse.json(data.product); // or just data if you're wrapping it
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
