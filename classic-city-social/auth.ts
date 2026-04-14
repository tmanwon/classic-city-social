import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import connectMongoDB from "./config/mongodb";
import User from "@/src/app/models/userSchema";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials) return null;

                const email = credentials.email as string;
                const password = credentials.password as string;

                if (!email || !password) return null;

                await connectMongoDB();
                const user = await User.findOne({ email }).lean();

                if (!user || !user.password) return null;

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) return null;

                return {
                    id: user._id.toString(),
                    _id: user._id.toString(),
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imageUrl: user.imageUrl,
                    interests: user.interests,
                    myEvents: user.myEvents,
                    eventsAttending: user.eventsAttending,
                    friends: user.friends,
                } as any;
            },
        }),
    ],
});
