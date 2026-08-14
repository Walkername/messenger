import { useEffect, useState } from "react";
import type { PageResponse } from "../../../types/common/page-response";
import type { ParticipantResponse } from "../../../types/chat/participant-response";
import {
    formatTimeLong,
    formatTimeShort,
} from "../../../utils/validation-time";
import ModalWindow from "../../modal-window/modal-window";
import "./participants-list.css";
import { chatService } from "../../../services/chat-service";
import presenceService from "../../../services/presence-service";
import type { PresenceEvent } from "../../../types/presence/presence";
import { ShieldUser } from "lucide-react";

interface ParticipantsListProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: number;
    ownerId: number;
}

export default function ParticipantsList({
    isOpen,
    onClose,
    chatId,
    ownerId,
}: ParticipantsListProps) {
    const [participants, setParticipants] =
        useState<PageResponse<ParticipantResponse>>();

    useEffect(() => {
        if (isOpen) {
            chatService.getParticipantsFromChat(chatId).then((data) => {
                setParticipants(data);
            });
        }
    }, [isOpen, chatId]);

    useEffect(() => {
        const accountIds: number[] =
            participants?.content.map((p) => p.accountId) ?? [];
        if (accountIds.length === 0) return;
        presenceService.subscribeToAccounts(accountIds);

        const handlePresenceUpdate = (event: PresenceEvent) => {
            setParticipants((prev) => {
                if (!prev) return prev;

                const updatedContent = prev.content.map((participant) =>
                    participant.accountId === event.accountId
                        ? { ...participant, online: event.online }
                        : participant,
                );

                return {
                    ...prev,
                    content: updatedContent,
                };
            });
        };

        presenceService.registerMessageHandler(handlePresenceUpdate);

        return () => {
            presenceService.unsubscribeFromAccounts(accountIds);
        };
    });

    return (
        <ModalWindow isOpen={isOpen} onClose={onClose}>
            <div
                className="chat-window-participants-list"
                onClick={(e) => e.stopPropagation()}
            >
                {participants?.content.map((participant, index) => (
                    <div className={`chat-participant-card`} key={index}>
                        <div className="chat-participant-card-personal">
                            <span className="chat-participant-card-firstname">
                                {participant.firstName}
                            </span>
                            <span className="chat-participant-card-username">
                                @{participant.username} {participant.online && (
                                    <span className="chat-participant-status-icon"></span>
                                )}
                            </span>
                        </div>
                        {participant.accountId === ownerId && (
                            <span className="chat-participant-card-admin">
                                <ShieldUser color="orange" />
                            </span>
                        )}
                        <span
                            className="chat-participant-card-joined-at"
                            data-full-date={formatTimeLong(
                                participant.joinedAt,
                            )}
                        >
                            Joined at: {formatTimeShort(participant.joinedAt)}
                        </span>
                    </div>
                ))}
            </div>
        </ModalWindow>
    );
}
