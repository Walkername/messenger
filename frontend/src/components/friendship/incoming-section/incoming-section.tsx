import { useCallback, useEffect, useRef, useState } from "react";
import type { PageResponse } from "../../../types/common/page-response";
import { friendshipService } from "../../../services/friendship-service";
import "./incoming-section.css";
import { formatTimeLong } from "../../../utils/validation-time";
import type { IncomingRequestResponse } from "../../../types/friendship/friendship";

const PAGE_SIZE = 20;

export default function IncomingSection() {
    const [incomingInvitations, setIncomingInvitations] = useState<
        PageResponse<IncomingRequestResponse>
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
            const data = await friendshipService.getMyIncomingInvites(
                0,
                PAGE_SIZE,
            );

            if (cancelled) {
                return;
            }

            currentPageRef.current = data.page;

            setIncomingInvitations(data);
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

            const data = await friendshipService.getMyIncomingInvites(
                nextPage,
                PAGE_SIZE,
            );

            currentPageRef.current = data.page;

            setIncomingInvitations((prev) => ({
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

    const handleAcceptInvitation = (accountId: number) => {
        friendshipService.inviteAsFriend(accountId).then(() => {
            window.location.reload();
        });
    };

    return (
        <div
            className="incoming-invitations-container"
            ref={containerRef}
            onScroll={handleScroll}
        >
            {incomingInvitations?.content.map((invitation, index) => (
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
                                handleAcceptInvitation(invitation.subscriberId)
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
