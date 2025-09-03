import { NextRequest, NextResponse } from "next/server";
import { withRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
    const rateLimitResponse = await withRateLimit(request, 'api');

    if (rateLimitResponse) {
        return rateLimitResponse;
    }

    return NextResponse.json({
        message: "Request successful",
        timestamp: new Date().toISOString(),
    });
}

export const runtime = 'edge';