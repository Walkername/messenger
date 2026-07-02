import { useState } from "react";
import type { ChatResponse } from "../../../types/chat/chat-response";
import {
    formatTimeLong,
    formatTimeShort,
} from "../../../utils/validation-time";
import "./chat-header.css";
import ParticipantsList from "../participants-list/participants-list";
import InviteUserWindow from "../invite-user-window/invite-user-window";

interface ChatHeaderProps {
    chat: ChatResponse;
}

export default function ChatHeader({ chat }: ChatHeaderProps) {
    const [isParticipantsModalOpen, setIsParticipantsModalOpen] =
        useState<boolean>(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    return (
        <div className="chat-window-header">
            <div className="chat-window-header-info">
                <h3 className="chat-window-header-name">{chat.name}</h3>
                <span
                    className="chat-window-participants-number"
                    onClick={() => setIsParticipantsModalOpen(true)}
                >
                    {chat.participantsNumber} members
                </span>
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
                    onClick={() => {
                        setIsInviteModalOpen(true);
                    }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M12 5v14M5 12h14"></path>
                    </svg>
                    Invite
                </button>
            </div>

            <ParticipantsList
                isOpen={isParticipantsModalOpen}
                onClose={() => setIsParticipantsModalOpen(false)}
                chatId={chat.id}
                ownerId={chat.ownerAccountId}
            />
            <InviteUserWindow
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                chatId={chat.id}
            />
        </div>
    );
}
