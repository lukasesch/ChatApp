package com.lukas.chat.chatbackend.repository;

import com.lukas.chat.chatbackend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository
    extends JpaRepository<ChatMessage, Long> {}
