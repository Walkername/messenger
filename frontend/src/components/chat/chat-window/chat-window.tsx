// ChatWindow.tsx
import { useState, useEffect, useRef } from "react";
import {
    getChat,
    getMessagesFromChat,
    getParticipantsFromChat,
    inviteUserToChat,
    sendMessageToChat,
} from "../../../api/chat-api";
import type { PageResponse } from "../../../types/common/page-response";
import type { MessageResponse } from "../../../types/chat/message-response";
import type { MessageRequest } from "../../../types/chat/message-request";
import getClaimFromToken from "../../../utils/token-validation";
import "./chat-window.css";
import type { ChatResponse } from "../../../types/chat/chat-response";
import { Client } from "@stomp/stompjs";
import type { ParticipantResponse } from "../../../types/chat/participant-response";

interface ChatWindowProps {
    chatId: number;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
    const token = localStorage.getItem("accessToken")!;
    const myAccountId = parseInt(getClaimFromToken(token, "id"));
    console.log(myAccountId);

    const stompRef = useRef<Client | null>(null);

    const [chat, setChat] = useState<ChatResponse>({
        id: 0,
        name: "",
        ownerId: 0,
        type: "",
        participantsNumber: 0,
        lastMessage: "",
        lastMessageAt: "",
        createdAt: "",
    });

    const [messages, setMessages] = useState<PageResponse<MessageResponse>>({
        content: [],
        page: 0,
        limit: 10,
        totalElements: 0,
        totalPages: 0,
    });
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatTimeShort = (dateString: string) => {
        const dateObj: Date = new Date(dateString);
        return dateObj.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatMessageTimeShort = (dateString: string) => {
        const dateObj: Date = new Date(dateString);
        return dateObj.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const formatTimeLong = (dateString: string) => {
        const dateObj: Date = new Date(dateString);
        return dateObj.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    useEffect(() => {
        getChat(chatId).then((data) => {
            setChat(data);
        });

        getMessagesFromChat(chatId).then((data) => {
            setMessages(data);
        });
    }, [chatId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message: MessageRequest = {
            content: newMessage,
        };

        sendMessageToChat(chatId, message).then(() => {
            setNewMessage("");
            getMessagesFromChat(chatId).then((data) => {
                setMessages(data);
            });
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

    useEffect(() => {
        const stompClient = new Client({
            brokerURL: import.meta.env.VITE_BACKEND_WEBSOCKET_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: () => {
                console.log("✅ WebSocket connected");

                stompClient.subscribe(`/topic/chat/${chat.id}`, (msg) => {
                    try {
                        const received: MessageResponse = JSON.parse(msg.body);
                        setMessages((prev) => ({
                            ...prev,
                            content: [received, ...prev.content],
                            totalElements: prev.totalElements + 1,
                        }));
                    } catch (e) {
                        console.error("Message parse error:", e);
                    }
                });
            },

            onStompError: (frame) => {
                console.error("❌ STOMP error:", frame.headers["message"]);
            },
        });

        stompClient.activate();
        stompRef.current = stompClient;

        return () => {
            stompClient.deactivate();
        };
    }, [chat?.id, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.content]);

    const [inviteModalWindowVisibility, setInviteModalWindowVisibility] =
        useState<boolean>(false);

    const handleClickChatInviteButton = () => {
        setInviteModalWindowVisibility(true);
    };

    const closeInviteModalWindow = () => {
        setInviteModalWindowVisibility(false);
        setInviteStatus("");
    };

    const [usernameToInvite, setUsernameToInvite] = useState("");
    const [inviteStatus, setInviteStatus] = useState("");

    const handleUsernameInviteChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value;
        setUsernameToInvite(value);
    };

    const handleChatInvite = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        inviteUserToChat(chatId, usernameToInvite)
            .then((data) => {
                if (data.ok) {
                    setInviteStatus("User has been invited");
                } else {
                    setInviteStatus("Failed to invite user");
                }

                setUsernameToInvite("");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const [
        participantsModalWindowVisibility,
        setParticipantsModalWindowVisibility,
    ] = useState<boolean>(false);

    const [participants, setParticipants] =
        useState<PageResponse<ParticipantResponse>>();

    const handleClickParticipantsButton = () => {
        getParticipantsFromChat(chatId).then((data) => {
            setParticipants(data);
        });

        setParticipantsModalWindowVisibility(true);
    };

    const closeParticipantsModalWindow = () => {
        setParticipantsModalWindowVisibility(false);
    };

    return (
        <div className="chat-window">
            <div className="chat-window-header">
                <div className="chat-window-header-info">
                    <h3 className="chat-window-header-name">{chat.name}</h3>
                    <span
                        className="chat-window-participants-number"
                        onClick={handleClickParticipantsButton}
                    >
                        {chat.participantsNumber} members
                    </span>
                    {participantsModalWindowVisibility && (
                        <div
                            className="chat-window-participants-list-container"
                            onClick={closeParticipantsModalWindow}
                        >
                            <div
                                className="chat-window-participants-list"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className="modal-close-btn"
                                    onClick={closeParticipantsModalWindow}
                                >
                                    ×
                                </button>
                                {participants?.content.map(
                                    (participant, index) => (
                                        <div
                                            className={`chat-participant-card`}
                                            key={index}
                                        >
                                            <div className="chat-participant-card-personal">
                                                <span className="chat-participant-card-firstname">
                                                    {participant.firstName}
                                                </span>
                                                <span className="chat-participant-card-username">
                                                    @{participant.username}
                                                </span>
                                            </div>
                                            {participant.accountId ===
                                                chat.ownerId && (
                                                <span className="chat-participant-card-admin">Administrator</span>
                                            )}
                                            <span
                                                className="chat-participant-card-joined-at"
                                                data-full-date={formatTimeLong(
                                                    participant.joinedAt,
                                                )}
                                            >
                                                Joined at:{" "}
                                                {formatTimeShort(
                                                    participant.joinedAt,
                                                )}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                    <span
                        className="chat-window-header-created-at"
                        data-full-date={formatTimeLong(chat.createdAt)}
                    >
                        Created: {formatTimeShort(chat.createdAt)}
                    </span>
                </div>
                <div className="chat-window-header-functions">
                    <button
                        className="chat-invite-button"
                        onClick={handleClickChatInviteButton}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path d="M12 5v14M5 12h14"></path>
                        </svg>
                        Invite
                    </button>
                    {inviteModalWindowVisibility && (
                        <div
                            className="chat-invite-modal-window-container"
                            onClick={closeInviteModalWindow}
                        >
                            <div
                                className="chat-invite-modal-window"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <form
                                    className="chat-invite-form"
                                    onSubmit={handleChatInvite}
                                >
                                    <button
                                        type="button"
                                        className="modal-close-btn"
                                        onClick={closeInviteModalWindow}
                                    >
                                        ×
                                    </button>
                                    <span className="chat-invite-window-description">
                                        You can invite someone to the chat:
                                    </span>
                                    <label className="chat-invite-username-label">
                                        Username:
                                    </label>
                                    <input
                                        className="chat-invite-input"
                                        value={usernameToInvite}
                                        onChange={handleUsernameInviteChange}
                                        type="text"
                                        required
                                        placeholder="Username"
                                    />
                                    <input
                                        className="chat-invite-submit-button"
                                        type="submit"
                                        value="Invite"
                                    />
                                    {inviteStatus && (
                                        <div
                                            className={`invite-status ${inviteStatus.includes("Failed") ? "error" : "success"}`}
                                        >
                                            {inviteStatus}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="messages-container">
                <div ref={messagesEndRef} />
                {messages.content.map((msg) => (
                    <div
                        key={msg.id}
                        className={`message ${msg.accountId === myAccountId ? "own" : "other"}`}
                    >
                        <div
                            className="message-owner"
                            hidden={
                                msg.accountId === myAccountId ? true : false
                            }
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
            <form className="message-input-section" onSubmit={sendMessage}>
                <div className="message-input-container">
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleTextareaChange}
                        placeholder="Message"
                        maxLength={300}
                    />
                    <div className="message-input-functions">
                        <svg
                            onClick={sendMessage}
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
        </div>
    );
}
