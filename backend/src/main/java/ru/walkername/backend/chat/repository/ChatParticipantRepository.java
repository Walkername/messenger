package ru.walkername.backend.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.chat.entity.ChatParticipant;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    boolean existsByChatIdAndUserId(Long chatId, Long userId);

}
