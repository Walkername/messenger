import { useEffect, useState } from "react";
import { friendshipService } from "../../../services/friendship-service";
import type { PageResponse } from "../../../types/common/page-response";
import { formatTimeLong } from "../../../utils/validation-time";
import "./all-friends-list.css";
import type { FriendResponse } from "../../../types/friendship/friendship";
import presenceService from "../../../services/presence-service";
import type { PresenceEvent } from "../../../types/presence/presence";

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

    const handleRemoveFromFriend = (accountId: number) => {
        friendshipService.removeFromFriend(accountId);
        window.location.reload();
    };

    return (
        <div className="friends-list">
            {friends &&
                friends.content.map((friend, index) => (
                    <div key={index} className="friend-card">
                        <div className="friend-card-info">
                            <span className="friend-card-firstname">
                                {friend.firstname}
                            </span>
                            <span className="friend-card-username">
                                @{friend.username}
                                {friend.online && (
                                    <span className="online-status-icon"></span>
                                )}
                            </span>
                            <span className="friend-card-sent-at">
                                {formatTimeLong(friend.createdAt)}
                            </span>
                        </div>
                        <div className="friend-card-functions">
                            <button
                                className="friend-card-remove"
                                onClick={() =>
                                    handleRemoveFromFriend(friend.friendId)
                                }
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
}
