package ru.walkername.backend.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.chat.entity.Chat;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query(value = "SELECT c FROM Chat c JOIN ChatParticipant cp ON c.id = cp.chatId WHERE c.id = :chatId AND cp.accountId = :accountId")
    Optional<Chat> findOneByChatIdAndAccountId(Long chatId, Long accountId);

    @Query(value = "SELECT c FROM Chat c JOIN ChatParticipant cp ON c.id = cp.chatId WHERE cp.accountId = :accountId")
    Page<Chat> findByAccountId(Long accountId, Pageable pageable);

    @Query("update Chat c set c.lastMessage = :lastMessage, c.lastMessageAt = :lastMessageAt where c.id = :id")
    @Modifying
    void updateLastMessageById(Long id, String lastMessage, Instant lastMessageAt);

}
