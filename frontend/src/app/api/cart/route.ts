// src/app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("Received cart request", body);
  return NextResponse.json({ message: "Cart received" });
}
