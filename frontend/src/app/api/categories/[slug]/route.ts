import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  slug: string;
}

interface Context {
  params: RouteParams;
}

export async function GET(
  request: NextRequest,
  { params }: Context // Apply the Context interface here
) {
  const { slug } = params; // Now params is correctly typed as RouteParams

  try {
    const backendRes = await fetch(
      `https://ecommerce-j5j0.onrender.com/api/categories/${encodeURIComponent(
        slug
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from backend" },
        { status: backendRes.status }
      );
    }

    const data: { products: unknown } = await backendRes.json();
    return NextResponse.json({ products: data.products });
  } catch (error) {
    console.error("Error fetching from backend:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}