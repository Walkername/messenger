import { useEffect, useRef, useState } from "react";
import ModalWindow from "../../modal-window/modal-window";
import "./start-private-chat-window.css";
import { chatService } from "../../../services/chat-service";
import type { MessageRequest } from "../../../types/chat/message-request";
import type { CreateChatRequest } from "../../../types/chat/create-chat-request";
import { useAuthStore } from "../../../auth/store";
import { useNavigate } from "react-router-dom";
import type { ChatResponse } from "../../../types/chat/chat-response";

interface StartPrivateChatWindowProps {
    interlocutorId: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function StartPrivateChatWindow({
    interlocutorId,
    isOpen,
    onClose,
}: StartPrivateChatWindowProps) {
    const navigate = useNavigate();
    const [chat, setChat] = useState<ChatResponse>(null);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        if (isOpen) {
            chatService
                .getChatWithInterlocutorId(interlocutorId)
                .then((data) => {
                    setChat(data);
                });
        }
    }, [interlocutorId, isOpen]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        let currentChat = chat;
        
        if (chat === null) {
            const myAccountId = useAuthStore.getState().accountId;
            const request: CreateChatRequest = {
                name: `private-${myAccountId}-${interlocutorId}`,
                type: "PRIVATE",
                participantsIds: [interlocutorId],
            };
            currentChat = await chatService.createChat(request);
            setChat(currentChat);
        }

        if (!newMessage.trim()) return;

        const message: MessageRequest = {
            content: newMessage,
        };
        
        await chatService.sendMessageToChat(currentChat.id, message).then(() => {
            handleClose();
        });

        navigate(`/chats/${currentChat.id}`);
    };

    const handleClose = () => {
        setNewMessage("");
        onClose();
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleTextareaChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        const value = e.target.value;

        if (value.length > 300) return;

        setNewMessage(value);

        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
        <ModalWindow isOpen={isOpen} onClose={handleClose}>
            <form
                className="start-chat-message-input-section"
                onSubmit={sendMessage}
            >
                <div className="start-chat-message-input-container">
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleTextareaChange}
                        placeholder="Message"
                        maxLength={300}
                    />
                </div>

                <input
                    className="start-chat-message-input-submit"
                    type="submit"
                    value="Send"
                />
            </form>
        </ModalWindow>
    );
}
