import { useEffect, useState } from "react";
import type { PageResponse } from "../../../types/common/page-response";
import type { FriendshipResponse } from "../../../types/friendship/friendship-response";
import { friendshipService } from "../../../services/friendship-service";
import "./outgoing-section.css";
import { formatTimeLong } from "../../../utils/validation-time";

export default function OutgoingSection() {
    const [outgoingInvitations, setOutgoingInvitations] =
        useState<PageResponse<FriendshipResponse>>();
    useEffect(() => {
        friendshipService.getMyOutgoingInvites().then((data) => {
            setOutgoingInvitations(data);
        });
    }, []);

    const handleRevokeInvitation = (accountId: number) => {
        friendshipService.removeFromFriend(accountId);
        window.location.reload();
    };

    return (
        <div className="outgoing-invitations-container">
            {outgoingInvitations &&
                outgoingInvitations.content.map((invitation, index) => (
                    <div key={index} className="outgoing-invitation-card">
                        <div className="outgoing-invitation-card-info">
                            <span className="outgoing-invitation-card-firstname">
                                {invitation.firstname}
                            </span>
                            <span className="outgoing-invitation-card-username">
                                @{invitation.username}
                            </span>
                            <span className="outgoing-invitation-card-sent-at">
                                {formatTimeLong(invitation.createdAt)}
                            </span>
                        </div>
                        <div className="outgoing-invitation-card-functions">
                            <button
                                className="incoming-invitation-card-accept"
                                onClick={() =>
                                    handleRevokeInvitation(invitation.targetId)
                                }
                            >
                                Revoke
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
}
