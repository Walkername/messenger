package ru.walkername.backend.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.walkername.backend.chat.entity.Chat;
import ru.walkername.backend.chat.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findMessagesByChat(Chat chat, Pageable pageable);

}
