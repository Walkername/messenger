import type { FriendshipResponse } from "../friendship/friendship-response";

export type ProfileOnlineEvent = {
    accountId: number;
    profile: FriendshipResponse;
    isOnline: boolean;
}