package ru.walkername.backend.chat.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.chat.dto.ChatRequest;
import ru.walkername.backend.chat.dto.ChatResponse;
import ru.walkername.backend.chat.entity.Chat;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    Chat toChat(ChatRequest chatRequest);

    ChatResponse toChatResponse(Chat chat);

}
