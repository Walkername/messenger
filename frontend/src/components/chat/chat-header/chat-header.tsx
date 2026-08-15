import { useState } from "react";
import type { ChatResponse } from "../../../types/chat/chat-response";
import {
    formatTimeLong,
    formatTimeShort,
} from "../../../utils/validation-time";
import "./chat-header.css";
import ParticipantsList from "../participants-list/participants-list";
import InviteUserWindow from "../invite-user-window/invite-user-window";
import { UserRoundPlus } from "lucide-react";

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
                {chat.type === "GROUP" && (
                    <div className="chat-window-header-name">{chat.name}</div>
                )}
                {chat.type === "PRIVATE" && (
                    <div className="chat-window-header-interlocutor-names">
                        {chat.name.split(":")[0] && (
                            <span className="chat-window-header-interlocutor-name">
                                {chat.name.split(":")[0]}
                            </span>
                        )}
                        <span className="chat-window-header-interlocutor-username">
                            @{chat.name.split(":")[1]}
                        </span>
                    </div>
                )}

                {chat.type === "GROUP" && (
                    <span
                        className="chat-window-participants-number"
                        onClick={() => setIsParticipantsModalOpen(true)}
                    >
                        {chat.participantsNumber} members
                    </span>
                )}
                <span
                    className="chat-window-header-created-at"
                    data-full-date={formatTimeLong(chat.createdAt)}
                >
                    Created: {formatTimeShort(chat.createdAt)}
                </span>
            </div>
            {chat.type === "GROUP" && (
                <>
                    <div className="chat-window-header-functions">
                        <button
                            className="chat-invite-button"
                            onClick={() => {
                                setIsInviteModalOpen(true);
                            }}
                        >
                            <UserRoundPlus size={22} color="gray" /> Invite
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
                </>
            )}
        </div>
    );
}
