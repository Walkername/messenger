package ru.walkername.backend.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.chat.entity.Chat;

import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query(value = "SELECT c FROM Chat c JOIN ChatParticipant cp ON c.id = cp.chatId WHERE c.id = :chatId AND cp.userId = :userId")
    Optional<Chat> findOneByChatIdAndUserId(Long chatId, Long userId);

}
