import { handleAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Assuming 'handleAuth' needs to be used with 'NextResponse'
export async function GET(request: NextRequest, { params }: { params: { kindeAuth: string } }) {
  try {
    // Extract endpoint from params
    const endpoint = params.kindeAuth;

    // Pass request to the handleAuth method and obtain the result (likely Express-style handler)
    const responseHandler = handleAuth(request, endpoint);

    // If response is already a NextResponse, return it; otherwise adapt it
    return NextResponse.json({ message: "Auth handled successfully", data: responseHandler });
  } catch (error) {
    return NextResponse.json({ error: "Auth failed", details: error }, { status: 500 });
  }
}
