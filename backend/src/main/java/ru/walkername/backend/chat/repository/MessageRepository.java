package ru.walkername.backend.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.Message;
import ru.walkername.backend.chat.view.MessageView;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
            SELECT new ru.walkername.backend.chat.view.MessageView(
                            m.id,
                            m.chat.id,
                            a.id,
                            a.username,
                            m.content,
                            m.sentAt
                        )
                        FROM Message m
                        JOIN Account a
                        ON a.id = m.accountId
                        where m.chat = :chat
            """)
    Page<MessageView> findMessagesByChat(Chat chat, Pageable pageable);

}
