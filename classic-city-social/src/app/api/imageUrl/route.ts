import { NextResponse, NextRequest } from "next/server";
import connectMongoDB from '@/config/mongodb';
import Event from "@/src/app/models/eventSchema";


export const dynamic = "force-dynamic";

/**
 * API endpoint for image hosting using imgbb
 */

export async function POST(request: NextRequest) {
    const { image } = await request.json();

    // Clean base64 string
    const cleanedImage = image.replace(/^data:image\/\w+;base64,/, "");

    const formData = new FormData();
    formData.append("image", cleanedImage);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_CDN_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    if (response.ok) {
        const data = await response.json();
        return new NextResponse(JSON.stringify({ data }), {
            status: 200,
            headers: {
                "content-type": "application/json",
            },
        });
    } else {
        return new NextResponse(JSON.stringify({ error: "Failed to upload image" }), {
            status: 500,
            headers: {
                "content-type": "application/json",
            },
        });
    }
}