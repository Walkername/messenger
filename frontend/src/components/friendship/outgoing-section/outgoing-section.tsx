import { useCallback, useEffect, useRef, useState } from "react";
import type { PageResponse } from "../../../types/common/page-response";
import { friendshipService } from "../../../services/friendship-service";
import "./outgoing-section.css";
import { formatTimeLong } from "../../../utils/validation-time";
import type { OutgoingRequestResponse } from "../../../types/friendship/friendship";

const PAGE_SIZE = 20;

export default function OutgoingSection() {
    const [outgoingInvitations, setOutgoingInvitations] = useState<
        PageResponse<OutgoingRequestResponse>
    >({
        content: [],
        page: 0,
        limit: PAGE_SIZE,
        totalElements: 0,
        totalPages: 0,
    });

    const [hasMore, setHasMore] = useState(true);
    const currentPageRef = useRef(0);
    const loadingMoreRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const data = await friendshipService.getMyOutgoingInvites(
                0,
                PAGE_SIZE,
            );

            if (cancelled) {
                return;
            }

            currentPageRef.current = data.page;

            setOutgoingInvitations(data);
            setHasMore(data.page + 1 < data.totalPages);
        };

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const loadMoreChats = useCallback(async () => {
        if (loadingMoreRef.current || !hasMore) {
            return;
        }

        loadingMoreRef.current = true;

        try {
            const nextPage = currentPageRef.current + 1;

            const data = await friendshipService.getMyOutgoingInvites(
                nextPage,
                PAGE_SIZE,
            );

            currentPageRef.current = data.page;

            setOutgoingInvitations((prev) => ({
                ...data,
                content: [...prev.content, ...data.content],
            }));

            setHasMore(data.page + 1 < data.totalPages);
        } finally {
            loadingMoreRef.current = false;
        }
    }, [hasMore]);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const distanceToBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        if (distanceToBottom < 50 && hasMore && !loadingMoreRef.current) {
            loadMoreChats();
        }
    }, [hasMore, loadMoreChats]);

    const handleRevokeInvitation = (accountId: number) => {
        friendshipService.removeFromFriend(accountId);
        window.location.reload();
    };

    return (
        <div
            className="outgoing-invitations-container"
            ref={containerRef}
            onScroll={handleScroll}
        >
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
