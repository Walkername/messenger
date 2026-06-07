import { useEffect, useState } from 'react';
import { getMyChats } from '../../../api/chat-api';
import type { PageResponse } from '../../../types/common/page-response';
import type { ChatResponse } from '../../../types/chat/chat-response';
import './chat-list.css';

interface ChatListProps {
    onSelectChat: (chatId: number) => void;
}

export default function ChatList({ onSelectChat }: ChatListProps) {
    const [chats, setChats] = useState<PageResponse<ChatResponse> | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyChats()
            .then((data) => {
                setChats(data);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleSelectChat = (chatId: number) => {
        setSelectedId(chatId);
        onSelectChat(chatId);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Только что';
        if (diffMins < 60) return `${diffMins} мин`;
        if (diffHours < 24) return `${diffHours} ч`;
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн`;
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const getChatTypeClass = (type: string) => {
        switch (type.toLowerCase()) {
            case 'private':
                return 'chat-type-private';
            case 'group':
                return 'chat-type-group';
            case 'channel':
                return 'chat-type-channel';
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <div className="chat-list-loading">
                <div className="loading-spinner"></div>
                <p>Загрузка чатов...</p>
            </div>
        );
    }

    return (
        <div className="chat-list">
            <div className="chat-list-header">
                <button className="new-chat-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Новый чат
                </button>
            </div>
            <div className="chat-items">
                {chats?.content.length === 0 ? (
                    <div className="no-chats">
                        <div className="no-chats-icon">💬</div>
                        <p>У вас пока нет чатов</p>
                        <button className="start-chat-btn">Начать чат</button>
                    </div>
                ) : (
                    chats?.content.map((chat) => (
                        <div
                            key={chat.id}
                            className={`chat-item ${selectedId === chat.id ? 'active' : ''} ${getChatTypeClass(chat.type)}`}
                            onClick={() => handleSelectChat(chat.id)}
                        >
                            <div className="chat-info">
                                <div className="chat-info-header">
                                    <div className="chat-name">
                                        {chat.name}
                                        {chat.type === 'group' && <span className="group-badge">Группа</span>}
                                        {chat.type === 'channel' && <span className="channel-badge">Канал</span>}
                                    </div>
                                    <div className="chat-time">
                                        {formatTime(chat.lastMessageAt || chat.createdAt)}
                                    </div>
                                </div>
                                <div className="chat-last-message">
                                    {chat.lastMessage ? (
                                        <>
                                            <span className="message-preview">{chat.lastMessage}</span>
                                            {!chat.lastMessage && <span className="no-messages">Нет сообщений</span>}
                                        </>
                                    ) : (
                                        <span className="no-messages">Создан {new Date(chat.createdAt).toLocaleDateString('ru-RU')}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}