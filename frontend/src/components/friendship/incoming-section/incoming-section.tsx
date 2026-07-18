import { useEffect, useState } from "react";
import type { PageResponse } from "../../../types/common/page-response";
import { friendshipService } from "../../../services/friendship-service";
import "./incoming-section.css";
import { formatTimeLong } from "../../../utils/validation-time";
import type { IncomingRequestResponse } from "../../../types/friendship/friendship";

export default function IncomingSection() {
    const [incomingInvitations, setIncomingInvitations] =
        useState<PageResponse<IncomingRequestResponse>>();

    useEffect(() => {
        friendshipService.getMyIncomingInvites().then((data) => {
            setIncomingInvitations(data);
        });
    }, []);

    const handleAcceptInvitation = (accountId: number) => {
        friendshipService.inviteAsFriend(accountId).then(() => {
            window.location.reload();
        });
    };

    return (
        <div className="incoming-invitations-container">
            {incomingInvitations &&
                incomingInvitations.content.map((invitation, index) => (
                    <div key={index} className="incoming-invitation-card">
                        <div className="incoming-invitation-card-info">
                            <span className="incoming-invitation-card-firstname">
                                {invitation.firstname}
                            </span>
                            <span className="incoming-invitation-card-username">
                                @{invitation.username}
                            </span>
                            <span className="incoming-invitation-card-sent-at">
                                {formatTimeLong(invitation.createdAt)}
                            </span>
                        </div>
                        <div className="incoming-invitation-card-functions">
                            <button
                                className="incoming-invitation-card-accept"
                                onClick={() =>
                                    handleAcceptInvitation(
                                        invitation.subscriberId,
                                    )
                                }
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
}
