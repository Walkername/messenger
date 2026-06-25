package ru.walkername.backend.chat.mapper;

import org.mapstruct.Mapper;
import ru.walkername.backend.chat.dto.MessageRequest;
import ru.walkername.backend.chat.dto.MessageResponse;
import ru.walkername.backend.chat.entity.Message;
import ru.walkername.backend.chat.view.MessageView;

@Mapper(componentModel = "spring")
public interface MessageMapper {

    Message toMessage(MessageRequest messageRequest);

    MessageResponse toMessageResponse(Message message);

    MessageResponse toMessageResponse(MessageView messageView);

}
