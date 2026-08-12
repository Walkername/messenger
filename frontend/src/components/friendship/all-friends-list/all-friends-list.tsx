import { useEffect, useState } from "react";
import { friendshipService } from "../../../services/friendship-service";
import type { PageResponse } from "../../../types/common/page-response";
import "./all-friends-list.css";
import type { FriendResponse } from "../../../types/friendship/friendship";
import presenceService from "../../../services/presence-service";
import type { PresenceEvent } from "../../../types/presence/presence";
import FriendCard from "../friend-card/friend-card";

export default function AllFriendsList() {
    const [friends, setFriends] = useState<PageResponse<FriendResponse>>();

    useEffect(() => {
        friendshipService.getMyFriends().then((data) => {
            setFriends(data);
        });
    }, []);

    useEffect(() => {
        const handlePresenceUpdate = (event: PresenceEvent) => {
            setFriends((prev) => {
                if (!prev) return prev;

                const updatedContent = prev.content.map((participant) =>
                    participant.friendId === event.accountId
                        ? { ...participant, online: event.online }
                        : participant,
                );

                return {
                    ...prev,
                    content: updatedContent,
                };
            });
        };

        const accountIds: number[] =
            friends?.content.map((f) => f.friendId) ?? [];
        presenceService.subscribeToAccounts(accountIds);
        presenceService.registerMessageHandler(handlePresenceUpdate);
    }, [friends?.content]);

    

    return (
        <div className="friends-list">
            {friends &&
                friends.content.map((friend, index) => (
                    <FriendCard key={index} profile={friend} />
                ))}
        </div>
    );
}
