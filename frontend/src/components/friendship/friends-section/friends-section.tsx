import { useEffect, useState } from "react";
import { friendshipService } from "../../../services/friendship-service";
import type { PageResponse } from "../../../types/common/page-response";
import type { FriendshipResponse } from "../../../types/friendship/friendship-response";

export default function FriendsSection() {
    const [friends, setFriends] = useState<PageResponse<FriendshipResponse>>();

    useEffect(() => {
        friendshipService.getMyFriends().then((data) => {
            setFriends(data);
        });
    }, []);
    
    return (
        <div>
            {friends &&
                friends.content.map((friend) => <div>{friend.username}</div>)}
        </div>
    );
}
