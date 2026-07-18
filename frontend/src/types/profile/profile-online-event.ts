import type { FriendResponse } from "../friendship/friendship";

export type ProfileOnlineEvent = {
    friend: FriendResponse;
    isOnline: boolean;
}