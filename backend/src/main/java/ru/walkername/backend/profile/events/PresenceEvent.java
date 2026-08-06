package ru.walkername.backend.profile.events;

public record PresenceEvent(
        Long accountId,
        boolean online
) {
}
