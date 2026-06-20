package ru.walkername.backend.user.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.user.dto.ProfileResponse;
import ru.walkername.backend.user.entity.Profile;

@Mapper(componentModel = "spring")
public interface ProfileMapper {

    ProfileResponse toProfileResponse(Profile profile);

}
