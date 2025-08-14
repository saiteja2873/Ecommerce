// src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Call your backend's login route
    const backendRes = await fetch("https://ecommerce-j5j0.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json({ error: data.error || "Login failed" }, { status: backendRes.status });
    }

    // Optional: You can set cookie from backend response here if needed

    return NextResponse.json(data);
  } catch (error) {
    console.error("Frontend API Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
