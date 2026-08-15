package ru.walkername.backend.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.chat.entity.ChatParticipant;
import ru.walkername.backend.chat.view.ChatParticipantView;

import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    boolean existsByChatIdAndAccountId(Long chatId, Long accountId);

    long countByChatId(Long chatId);

    @Query("""
            SELECT new ru.walkername.backend.chat.view.ChatParticipantView(
                cp.id,
                a.id,
                p.id,
                a.username,
                p.firstName,
                cp.joinedAt
            )
            FROM ChatParticipant cp
            JOIN Account a
            ON cp.accountId = a.id
            JOIN Profile p
            ON a.id = p.account.id
            WHERE cp.chatId = :chatId
            """)
    Page<ChatParticipantView> findByChatId(Long chatId, Pageable pageable);

    void deleteByChatIdAndAccountId(Long chatId, Long accountId);

    @Query("""
            SELECT new ru.walkername.backend.chat.view.ChatParticipantView(
                cp.id,
                a.id,
                p.id,
                a.username,
                p.firstName,
                cp.joinedAt
            )
            FROM ChatParticipant cp
            JOIN Chat c ON c.id = cp.chatId
            JOIN Profile p ON p.id = cp.accountId
            JOIN Account a ON a.id = cp.accountId
            WHERE c.id = :chatId AND cp.accountId != :myAccountId
            AND c.type = ru.walkername.backend.chat.entity.ChatType.PRIVATE
""")
    Optional<ChatParticipantView> findInterlocutorNameByChatId(Long chatId, Long myAccountId);

}
