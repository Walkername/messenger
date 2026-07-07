package ru.walkername.backend.profile.events;

import ru.walkername.backend.friendship.dto.FriendshipResponse;

public record ProfileStatusChangeEvent(
        Long accountId,
        FriendshipResponse profile,
        boolean isOnline
) {
}
