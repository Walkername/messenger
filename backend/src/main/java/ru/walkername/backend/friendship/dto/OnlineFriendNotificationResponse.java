package ru.walkername.backend.friendship.dto;

public record OnlineFriendNotificationResponse(
        Long targetAccountId,
        FriendResponse friend
) {
}
