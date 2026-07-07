package ru.walkername.backend.friendship.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.walkername.backend.common.dto.PageResponse;
import ru.walkername.backend.common.security.UserPrincipal;
import ru.walkername.backend.friendship.dto.FriendshipResponse;
import ru.walkername.backend.friendship.entity.Friendship;
import ru.walkername.backend.friendship.service.FriendshipService;
import ru.walkername.backend.profile.controller.ProfileStatusController;

import java.util.Set;

@RequiredArgsConstructor
@RestController
@RequestMapping("/friendship")
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final ProfileStatusController  profileStatusController;

    @GetMapping("/me")
    public ResponseEntity<PageResponse<FriendshipResponse>> getMyFriends(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "limit", defaultValue = "20") Integer limit,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        PageResponse<FriendshipResponse> response = friendshipService
                .findFriendsBySubscriberId(userPrincipal.accountId(), page, limit);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/me/online")
    public ResponseEntity<PageResponse<FriendshipResponse>> getMyOnlineFriends(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "limit", defaultValue = "20") Integer limit,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Set<Long> onlineProfiles = profileStatusController.getSessions().keySet();
        PageResponse<FriendshipResponse> onlineFriends = friendshipService
                .findOnlineFriendsBySubscriberId(
                        userPrincipal.accountId(),
                        onlineProfiles,
                        page,
                        limit
                );
        return new ResponseEntity<>(onlineFriends, HttpStatus.OK);
    }

    @GetMapping("/me/invitations/incoming")
    public ResponseEntity<PageResponse<FriendshipResponse>> getMyIncomingInvitations(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "limit", defaultValue = "20") Integer limit,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        PageResponse<FriendshipResponse> response = friendshipService
                .findSubscriptionsOnTargetId(userPrincipal.accountId(), page, limit);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/me/invitations/outgoing")
    public ResponseEntity<PageResponse<FriendshipResponse>> getMyOutgoingInvitations(
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "limit", defaultValue = "20") Integer limit,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        PageResponse<FriendshipResponse> response = friendshipService
                .findSubscriptionsBySubscriberId(userPrincipal.accountId(), page, limit);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/me/invite")
    public ResponseEntity<Friendship> inviteAsFriend(
            @RequestParam("id") Long targetId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Friendship friendship = friendshipService.inviteAsFriend(userPrincipal, targetId);
        return new ResponseEntity<>(friendship, HttpStatus.OK);
    }

    @PostMapping("/me/invite/usr")
    public ResponseEntity<Friendship> inviteAsFriend(
            @RequestParam String username,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        Friendship friendship = friendshipService.inviteAsFriend(userPrincipal, username);
        return new ResponseEntity<>(friendship, HttpStatus.OK);
    }

    @DeleteMapping("/me/remove/{id}")
    public ResponseEntity<HttpStatus> removeFromFriends(
            @PathVariable("id") Long targetId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        friendshipService.removeFromFriends(userPrincipal, targetId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
