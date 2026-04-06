export type Review = {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    sentiment?: 'positive' | 'negative' | 'neutral';
    createdAt: string;
}