package ru.walkername.backend.chat.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.walkername.backend.chat.repository.ChatParticipantRepository;
import ru.walkername.backend.chat.repository.ChatRepository;
import ru.walkername.backend.common.security.UserPrincipal;

@RequiredArgsConstructor
@Service
public class ChatAccessService {

    private final ChatRepository chatRepository;
    private final ChatParticipantRepository chatParticipantRepository;

    public boolean canAccessChat(Long chatId, UserPrincipal userPrincipal) {
        if (!chatRepository.existsById(chatId)) {
            return false;
        }

        if (userPrincipal.role().equals("ADMIN")) {
            return true;
        }

        return chatParticipantRepository.existsByChatIdAndAccountId(chatId, userPrincipal.accountId());
    }

}
