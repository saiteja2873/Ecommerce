import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get full URL
  const url = new URL(request.url);

  // Extract pathname segments
  const segments = url.pathname.split("/");

  // Assuming route: /api/products/[id]
  const id = segments[segments.length - 1];

  try {
    const backendRes = await fetch(
      `https://ecommerce-j5j0.onrender.com/api/products/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from backend" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from backend:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
