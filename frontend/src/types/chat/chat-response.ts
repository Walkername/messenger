
export type ChatResponse = {
    id: number;
    name: string;
    ownerId: number;
    type: string;
    participantsNumber: number;
    lastMessage: string;
    lastMessageAt: string;
    createdAt: string;
};