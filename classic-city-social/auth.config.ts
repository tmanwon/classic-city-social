import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
    session: {
        strategy: "jwt",
    },
    providers: [],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token._id = (user as any)._id || user.id;
                token.firstName = (user as any).firstName;
                token.lastName = (user as any).lastName;
                token.imageUrl = (user as any).imageUrl;
                token.interests = (user as any).interests;
                token.myEvents = (user as any).myEvents;
                token.eventsAttending = (user as any).eventsAttending;
                token.friends = (user as any).friends;
                token.email = user.email;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id as string,
                    _id: token._id as string,
                    firstName: token.firstName as string,
                    lastName: token.lastName as string,
                    imageUrl: token.imageUrl as string,
                    interests: token.interests as string[],
                    myEvents: token.myEvents as string[],
                    eventsAttending: token.eventsAttending as string[],
                    friends: token.friends as string[],
                    email: token.email as string,
                } as any;
            }
            return session;
        }
    }
};