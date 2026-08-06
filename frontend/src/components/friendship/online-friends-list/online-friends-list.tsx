import { useEffect, useState } from "react";
import "./online-friends-list.css";
import type { PageResponse } from "../../../types/common/page-response";
import { friendshipService } from "../../../services/friendship-service";
import { formatTimeLong } from "../../../utils/validation-time";
import type { FriendResponse } from "../../../types/friendship/friendship";

export default function OnlineFriendsList() {
    const [onlineFriends, setOnlineFriends] =
        useState<PageResponse<FriendResponse>>();

    useEffect(() => {
        friendshipService.getMyOnlineFriends().then((data) => {
            setOnlineFriends(data);
        });
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
                                @{friend.username} <span className="online-status-icon"></span>
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
