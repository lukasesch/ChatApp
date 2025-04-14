package com.lukas.chat.chatbackend.controller;

import com.lukas.chat.chatbackend.model.ChatMessage;
import com.lukas.chat.chatbackend.repository.ChatMessageRepository;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final ChatMessageRepository chatMessageRepository;

    public ChatController(
        SimpMessagingTemplate messagingTemplate,
        ChatMessageRepository chatMessageRepository
    ) {
        this.messagingTemplate = messagingTemplate;
        this.chatMessageRepository = chatMessageRepository;
    }

    @MessageMapping("/chat")
    public void receiveMassage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        chatMessageRepository.save(message);
        logger.info("Received message: {}", message);
        messagingTemplate.convertAndSend("/topic/messages", message);
    }
}
