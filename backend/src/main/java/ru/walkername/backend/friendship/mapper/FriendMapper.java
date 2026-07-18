package ru.walkername.backend.friendship.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.friendship.dto.FriendResponse;
import ru.walkername.backend.friendship.dto.IncomingRequestResponse;
import ru.walkername.backend.friendship.dto.OnlineFriendNotificationResponse;
import ru.walkername.backend.friendship.dto.OutgoingRequestResponse;
import ru.walkername.backend.friendship.entity.Friendship;
import ru.walkername.backend.friendship.view.FriendView;
import ru.walkername.backend.friendship.view.IncomingRequestView;
import ru.walkername.backend.friendship.view.OnlineFriendNotificationView;
import ru.walkername.backend.friendship.view.OutgoingRequestView;

@Mapper(componentModel = "spring")
public interface FriendMapper {

    FriendResponse toFriendResponse(FriendView view);

    FriendResponse toFriendResponse(Friendship entity);

    OutgoingRequestResponse toOutgoingRequestResponse(OutgoingRequestView view);

    IncomingRequestResponse toIncomingRequestResponse(IncomingRequestView view);

    OnlineFriendNotificationResponse toOnlineFriendNotificationResponse(OnlineFriendNotificationView view);

}
