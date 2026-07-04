package ru.walkername.backend.friendship.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.friendship.dto.FriendshipResponse;
import ru.walkername.backend.friendship.view.FriendshipView;

@Mapper(componentModel = "spring")
public interface FriendshipMapper {

    FriendshipResponse toFriendshipResponse(FriendshipView view);

}
