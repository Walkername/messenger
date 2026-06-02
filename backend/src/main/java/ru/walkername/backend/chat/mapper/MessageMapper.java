package ru.walkername.backend.chat.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.chat.dto.MessageRequest;
import ru.walkername.backend.chat.dto.MessageResponse;
import ru.walkername.backend.chat.entity.Message;

@Mapper(componentModel = "spring")
public interface MessageMapper {

    Message toMessage(MessageRequest messageRequest);

    MessageResponse toMessageResponse(Message message);

}
