import { useCallback, useEffect, useRef, useState } from "react";
import { friendshipService } from "../../../services/friendship-service";
import type { PageResponse } from "../../../types/common/page-response";
import "./all-friends-list.css";
import type { FriendResponse } from "../../../types/friendship/friendship";
import presenceService from "../../../services/presence-service";
import type { PresenceEvent } from "../../../types/presence/presence";
import FriendCard from "../friend-card/friend-card";

const PAGE_SIZE = 20;

export default function AllFriendsList() {
    const [friends, setFriends] = useState<PageResponse<FriendResponse>>({
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
            const data = await friendshipService.getMyFriends(0, PAGE_SIZE);

            if (cancelled) {
                return;
            }

            currentPageRef.current = data.page;

            setFriends(data);
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

            const data = await friendshipService.getMyFriends(
                nextPage,
                PAGE_SIZE,
            );

            currentPageRef.current = data.page;

            setFriends((prev) => ({
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

    return (
        <div
            className="friends-list"
            ref={containerRef}
            onScroll={handleScroll}
        >
            {friends &&
                friends.content.map((friend, index) => (
                    <FriendCard key={index} profile={friend} />
                ))}
        </div>
    );
}
