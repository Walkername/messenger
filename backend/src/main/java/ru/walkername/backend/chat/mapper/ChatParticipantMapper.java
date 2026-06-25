package ru.walkername.backend.chat.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.chat.dto.ChatParticipantResponse;
import ru.walkername.backend.chat.view.ChatParticipantView;

@Mapper(componentModel = "spring")
public interface ChatParticipantMapper {

    ChatParticipantResponse toChatParticipantResponse(ChatParticipantView chatParticipantView);

}
