package ru.walkername.backend.profile.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.profile.dto.ProfileResponse;
import ru.walkername.backend.profile.entity.Profile;
import ru.walkername.backend.profile.view.ProfileView;

@Mapper(componentModel = "spring")
public interface ProfileMapper {

    ProfileResponse toProfileResponse(Profile profile);

    ProfileResponse toProfileResponse(ProfileView profileView);

}
