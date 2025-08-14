import { NextRequest, NextResponse } from "next/server";

// Define params as a Promise per official Next.js v15 convention
type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  context: { params: Params }
): Promise<NextResponse> {
  const { id } = await context.params;

  try {
    const backendRes = await fetch(
      `https://ecommerce-j5j0.onrender.com/api/products/${encodeURIComponent(id)}`,
      {
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
  } catch (err) {
    console.error("Error fetching from backend:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
