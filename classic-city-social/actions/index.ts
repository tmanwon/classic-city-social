'use server';

import { FormData } from "undici-types";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function doLogout() {
    await signOut({ redirectTo: "/" });
}

export async function doCredentialLogin(formData: FormData) {
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    if (!email || !password) {
        return { error: { message: "Email and password are required" } };
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false
        });
        return { success: true };
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.type === "CredentialsSignin") {
                return { error: { message: "Invalid email or password" } };
            }
            return { error: { message: "Authentication error" } };
        }
        console.error("Unexpected error in doCredentialLogin:", error);
        return { error: { message: "Something went wrong. Please try again." } };
    }
}
