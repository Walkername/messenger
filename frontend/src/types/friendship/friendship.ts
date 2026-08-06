
export type FriendResponse = {
    id: number;
    friendId: number;
    username: string;
    firstname: string;
    createdAt: string;
    updatedAt: string;
    online: boolean;
};

export type IncomingRequestResponse = {
    id: number;
    subscriberId: number;
    username: string;
    firstname: string;
    createdAt: string;
    updatedAt: string;
}

export type OutgoingRequestResponse = {
    id: number;
    targetId: number;
    username: string;
    firstname: string;
    createdAt: string;
    updatedAt: string;
}

export type OnlineFriendNotificationResponse = {
    targetAccountId: number;
    friend: FriendResponse;
}