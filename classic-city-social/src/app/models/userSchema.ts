export type User = {
    id: string;
    firstName: string;
    lastName: string;
    friends: string[]
    imageUrl?: string;
    myEvents: string[]; // IDs of events the user has created
    eventsAttending: string[];
}