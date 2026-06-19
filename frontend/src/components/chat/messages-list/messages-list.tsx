import {
    useEffect,
    useRef,
    type Dispatch,
    type SetStateAction,
} from "react";
import getClaimFromToken from "../../../utils/token-validation";
import {
    formatMessageTimeShort,
    formatTimeLong,
    formatTimeMonthDay,
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

    const groupMessagesByDay = () => {
        const groups: {
            date: string;
            messages: MessageResponse[];
        }[] = [];

        messages.content.forEach((msg) => {
            const msgDate = new Date(msg.sentAt);
            const dateKey = msgDate.toDateString();

            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.date === dateKey) {
                lastGroup.messages.push(msg);
            } else {
                groups.push({ date: dateKey, messages: [msg] });
            }
        });

        return groups;
    };

    const groupedMessages = groupMessagesByDay();
    
    return (
        <div className="messages-container">
            <div ref={messagesEndRef} />
            {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex}>
                    <div className="date-divider">
                        <span className="date-divider-text">
                            {formatTimeMonthDay(group.date)}
                        </span>
                    </div>

                    {group.messages.toReversed().map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.accountId === myAccountId ? "own" : "other"}`}
                        >
                            <div
                                className="message-owner"
                                hidden={msg.accountId === myAccountId}
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
            ))}
        </div>
    );
}
