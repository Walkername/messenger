package ru.walkername.backend.profile.events;

import ru.walkername.backend.friendship.dto.FriendResponse;

public record ProfileStatusChangeEvent(
        FriendResponse friend,
        boolean isOnline
) {
}
