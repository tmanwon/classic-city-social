import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/friends", "/profile", "/api/users"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/friends") || pathname.startsWith("/profile") || pathname.startsWith("/api/users")) {
        if (request.method === "POST") {
            return NextResponse.next();
        }

        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

        if (!token) {
            return NextResponse.redirect(new URL("/signup", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/friends/:path*",
        "/profile/:path*",
        "/api/users/:path*",
    ],
};