package ru.walkername.backend.friendship.view;

public record OnlineFriendNotificationView(
        Long targetAccountId,
        FriendView friend
) {
}
