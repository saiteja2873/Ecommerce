// src/app/api/products/new/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const res = await fetch("http://localhost:3001/api/products/new");

    if (!res.ok) {
      throw new Error("Failed to fetch new products from backend");
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching new products:", error);
    return NextResponse.json({ error: "Failed to fetch new products" }, { status: 500 });
  }
}
