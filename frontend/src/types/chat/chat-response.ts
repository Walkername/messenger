
export type ChatResponse = {
    id: number;
    name: string;
    ownerAccountId: number;
    type: string;
    participantsNumber: number;
    lastMessage: string;
    lastMessageAt: string;
    createdAt: string;
};