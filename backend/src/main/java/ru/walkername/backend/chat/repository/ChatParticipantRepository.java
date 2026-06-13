package ru.walkername.backend.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.chat.dto.ParticipantResponse;
import ru.walkername.backend.chat.entity.ChatParticipant;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    boolean existsByChatIdAndAccountId(Long chatId, Long accountId);

    long countByChatId(Long chatId);

    @Query("""
            SELECT new ru.walkername.backend.chat.dto.ParticipantResponse(
                cp.id,
                a.id,
                u.id,
                a.username,
                u.firstName,
                cp.joinedAt
            )
            FROM ChatParticipant cp
            JOIN Account a
            ON cp.accountId = a.id
            JOIN User u
            ON a.id = u.account.id
            WHERE cp.chatId = :chatId
            """)
    Page<ParticipantResponse> findByChatId(Long chatId, Pageable pageable);

}
