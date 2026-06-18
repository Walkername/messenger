import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import getClaimFromToken from "../../../utils/token-validation";
import {
    formatMessageTimeShort,
    formatTimeLong,
} from "../../../utils/validation-time";
import { getMessagesFromChat } from "../../../api/chat-api";
import type { PageResponse } from "../../../types/common/page-response";
import type { MessageResponse } from "../../../types/chat/message-response";
import "./messages-list.css";

interface MessagesListProps {
    chatId: number;
    messages: PageResponse<MessageResponse>;
    setMessages: Dispatch<SetStateAction<PageResponse<MessageResponse>>>;
}

export default function MessagesList({
    chatId,
    messages,
    setMessages,
}: MessagesListProps) {
    const token = localStorage.getItem("accessToken")!;
    const myAccountId = parseInt(getClaimFromToken(token, "id"));

    useEffect(() => {
        getMessagesFromChat(chatId).then((data) => {
            setMessages(data);
        });
    }, [chatId, setMessages]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.content]);

    return (
        <div className="messages-container">
            <div ref={messagesEndRef} />
            {messages.content.map((msg) => (
                <div
                    key={msg.id}
                    className={`message ${msg.accountId === myAccountId ? "own" : "other"}`}
                >
                    <div
                        className="message-owner"
                        hidden={msg.accountId === myAccountId ? true : false}
                    >
                        {msg.username}
                    </div>
                    <div className="message-content">{msg.content}</div>
                    <div
                        className="message-time"
                        data-full-date={formatTimeLong(msg.sentAt)}
                    >
                        {formatMessageTimeShort(msg.sentAt)}
                    </div>
                </div>
            ))}
        </div>
    );
}
