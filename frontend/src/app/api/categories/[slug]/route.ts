// src/app/api/categories/[slug]/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } } // Destructure params directly from context
) {
  const { slug } = await Promise.resolve(params);

  try {
    const backendRes = await fetch(`https://ecommerce-j5j0.onrender.com/api/categories/${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from backend" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    return NextResponse.json({ products: data.products });
  } catch (error) {
    console.error("Error fetching from backend:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}