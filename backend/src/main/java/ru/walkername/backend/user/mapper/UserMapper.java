package ru.walkername.backend.user.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.user.dto.UserResponse;
import ru.walkername.backend.user.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toUserResponse(User user);

}
