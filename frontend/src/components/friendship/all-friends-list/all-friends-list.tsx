import { useEffect, useState } from "react";
import { friendshipService } from "../../../services/friendship-service";
import type { PageResponse } from "../../../types/common/page-response";
import type { FriendshipResponse } from "../../../types/friendship/friendship-response";
import { formatTimeLong } from "../../../utils/validation-time";
import "./all-friends-list.css";

export default function AllFriendsList() {
    const [friends, setFriends] = useState<PageResponse<FriendshipResponse>>();

    useEffect(() => {
        friendshipService.getMyFriends().then((data) => {
            setFriends(data);
        });
    }, []);
    
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
                            </span>
                            <span className="friend-card-sent-at">
                                {formatTimeLong(friend.createdAt)}
                            </span>
                        </div>
                        <div className="friend-card-functions">
                            <button
                                className="friend-card-remove"
                                onClick={() =>
                                    handleRemoveFromFriend(friend.targetId)
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