import { useEffect, useState } from "react";
import type { PageResponse } from "../../../types/common/page-response";
import type { FriendshipResponse } from "../../../types/friendship/friendship-response";
import { friendshipService } from "../../../services/friendship-service";

export default function OutgoingSection() {
    const [outgoingInvitations, setOutgoingInvitations] =
        useState<PageResponse<FriendshipResponse>>();
    useEffect(() => {
        friendshipService.getMyOutgoingInvites().then((data) => {
            setOutgoingInvitations(data);
        });
    }, []);

    return (
        <div>
            {outgoingInvitations &&
                outgoingInvitations.content.map((invite) => (
                    <div>{invite.username}</div>
                ))}
        </div>
    );
}
