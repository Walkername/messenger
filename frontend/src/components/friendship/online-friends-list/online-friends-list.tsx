import { useEffect, useState } from "react";
import "./online-friends-list.css";
import type { PageResponse } from "../../../types/common/page-response";
import type { FriendshipResponse } from "../../../types/friendship/friendship-response";
import websocketService from "../../../services/websocket-service";
import { friendshipService } from "../../../services/friendship-service";
import { formatTimeLong } from "../../../utils/validation-time";
import type { ProfileOnlineEvent } from "../../../types/profile/profile-online-event";

export default function OnlineFriendsList() {
    const [onlineFriends, setOnlineFriends] =
        useState<PageResponse<FriendshipResponse>>();

    const handleNewProfileOnline = (event: ProfileOnlineEvent) => {
        setOnlineFriends((prev) => {
            if (!prev) {
                return prev;
            }

            // Пользователь стал онлайн
            if (event.isOnline) {
                const alreadyExists = prev.content.some(
                    (friend) => friend.targetId === event.accountId,
                );

                if (alreadyExists) {
                    return prev;
                }

                return {
                    ...prev,
                    content: [...prev.content, event.profile],
                    totalElements: prev.totalElements + 1,
                };
            }

            // Пользователь ушел оффлайн
            return {
                ...prev,
                content: prev.content.filter(
                    (friend) => friend.targetId !== event.accountId,
                ),
                totalElements: Math.max(0, prev.totalElements - 1),
            };
        });
    };

    useEffect(() => {
        friendshipService.getMyOnlineFriends().then((data) => {
            setOnlineFriends(data);
        });
        websocketService.registerOnlineUsersHandler(handleNewProfileOnline);
    }, []);

    return (
        <div className="friends-list">
            {onlineFriends &&
                onlineFriends.content.map((friend, index) => (
                    <div key={index} className="friend-card">
                        <div className="friend-card-info">
                            <span className="friend-card-firstname">
                                {friend.firstname !== null ? friend.firstname : ""}
                            </span>
                            <span className="friend-card-username">
                                @{friend.username}
                            </span>
                            <span className="friend-card-sent-at">
                                {formatTimeLong(friend.createdAt)}
                            </span>
                        </div>
                        <div className="friend-card-functions">
                            <button className="friend-card-remove">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
}
