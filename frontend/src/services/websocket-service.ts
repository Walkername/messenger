import { Client } from "@stomp/stompjs";
import type { SignalingMessage } from "../types/call/webrtc";
import type { MessageResponse } from "../types/chat/message-response";
import { authService } from "./auth-service";
import type { ProfileOnlineEvent } from "../types/profile/profile-online-event";
import getClaimFromToken from "../utils/token-validation";

type MessageHandler = (message: any) => void;

class WebSocketService {
    private stompClient: Client | null = null;
    private subscriptions: Map<
        string,
        {
            subscription: any;
            handler: MessageHandler;
        }
    > = new Map();

    private handlers: {
        signaling?: (message: SignalingMessage) => void;
        chat?: Map<number, (message: MessageResponse) => void>;
        newOnlineProfile?: (message: ProfileOnlineEvent) => void;
    } = {
        chat: new Map(),
    };

    private isConnected = false;

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve();
                return;
            }

            const token = authService.getToken()!;

            this.stompClient = new Client({
                brokerURL: import.meta.env.VITE_BACKEND_WEBSOCKET_URL,
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,

                onConnect: () => {
                    console.log("✅ WebSocket connected");
                    this.isConnected = true;

                    this.subscribeToGlobalTopics();

                    this.sendMessage("/app/profile/register", getClaimFromToken(token, "id"));

                    resolve();
                },

                onDisconnect: () => {
                    console.log("❌ WebSocket disconnected");
                    this.isConnected = false;
                },

                onStompError: (error) => {
                    console.error("STOMP error:", error);
                    reject(error);
                },
            });

            this.stompClient.activate();
        });
    }

    private subscribeToGlobalTopics() {
        this.subscribeToTopic("/user/queue/friend-status-change", (message) => {
            if (this.handlers.newOnlineProfile) {
                const profile = JSON.parse(message.body);
                this.handlers.newOnlineProfile(profile);
            }
        });

        const accountId = authService.getAccountId();
        this.subscribeToTopic(`/topic/call/${accountId}`, (message) => {
            try {
                if (this.handlers.signaling) {
                    const data: SignalingMessage = JSON.parse(message.body);
                    this.handlers.signaling(data);
                }
            } catch (error) {
                console.error("Failed to parse signaling message:", error);
            }
        });
    }

    private subscribeToTopic(
        destination: string,
        handler: MessageHandler,
    ): string {
        if (!this.stompClient?.connected) {
            console.warn("WebSocket not connected, cannot subscribe");
            return "";
        }

        const subscription = this.stompClient.subscribe(destination, handler);
        const subscriptionId = `${destination}_${Date.now()}`;

        this.subscriptions.set(subscriptionId, {
            subscription,
            handler,
        });

        return subscriptionId;
    }

    registerSignalingHandler(handler: (message: SignalingMessage) => void) {
        this.handlers.signaling = handler;
    }

    registerOnlineUsersHandler(handler: (message: ProfileOnlineEvent) => void) {
        this.handlers.newOnlineProfile = handler;
    }

    sendMessage(destination: string, body: any) {
        if (this.stompClient?.connected) {
            this.stompClient.publish({
                destination,
                body: JSON.stringify(body),
            });
        } else {
            console.warn("WebSocket not connected");
        }
    }

    get connected(): boolean {
        return this.isConnected;
    }
}

export default new WebSocketService();
