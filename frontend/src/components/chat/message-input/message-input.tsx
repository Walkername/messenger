import { useRef, useState } from "react";
import type { MessageRequest } from "../../../types/chat/message-request";
import "./message-input.css";
import { chatService } from "../../../services/chat-service";

interface MessageInputProps {
    chatId: number;
    scrollToBottom: () => void;
}

export default function MessageInput({ chatId, scrollToBottom }: MessageInputProps) {
    const [newMessage, setNewMessage] = useState("");

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message: MessageRequest = {
            content: newMessage,
        };

        chatService.sendMessageToChat(chatId, message).then(() => {
            setNewMessage("");
            scrollToBottom();
        });
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

    const handleEnterSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e as unknown as React.FormEvent);
        }
    };

    return (
        <form className="message-input-section" onSubmit={sendMessage}>
            <div className="message-input-container">
                <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleEnterSubmit}
                    placeholder="Message"
                    maxLength={300}
                />
                <div className="message-input-functions">
                    <svg
                        onClick={sendMessage}
                        type="submit"
                        className="message-submit-button"
                        fill="#e3e3e3"
                        width="24px"
                        height="24px"
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ transform: "rotate(45deg)" }}
                    >
                        <polygon points="496 16 15.88 208 195 289 448 64 223 317 304 496 496 16" />
                    </svg>
                </div>
            </div>
        </form>
    );
}
