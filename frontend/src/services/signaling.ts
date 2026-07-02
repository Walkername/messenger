// services/signaling.ts
import { Client, type Message } from "@stomp/stompjs";
import type { SignalingMessage } from "../types/call/webrtc";
import { authService } from "./auth-service";

class SignalingService {
    private stompClient: Client | null = null;
    private onMessageCallback: ((message: SignalingMessage) => void) | null =
        null;

    connect(
        accountId: string,
        onMessage: (message: SignalingMessage) => void,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            this.onMessageCallback = onMessage;
            const token = authService.getToken();

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

                    this.stompClient?.subscribe(
                        `/topic/call/${accountId}`,
                        this.handleIncomingMessage.bind(this),
                    );
                    this.stompClient?.subscribe(
                        "/topic/active",
                        this.handleActiveUsers.bind(this),
                    );

                    this.sendMessage("/app/register", accountId);

                    resolve();
                },
                onDisconnect: () => {
                    console.log("❌ WebSocket disconnected");
                },
                onStompError: (error) => {
                    console.error("STOMP error:", error);
                    reject(error);
                },
            });

            this.stompClient.activate();
        });
    }

    private handleIncomingMessage(message: Message) {
        try {
            const data: SignalingMessage = JSON.parse(message.body);
            console.log(data);
            if (this.onMessageCallback) {
                this.onMessageCallback(data);
            }
        } catch (error) {
            console.error("Failed to parse signaling message:", error);
        }
    }

    private handleActiveUsers(message: Message) {
        console.log("Active users:", message.body);
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

    sendSignalingMessage(message: SignalingMessage) {
        console.log(`/video-call/${message.type}`);
        const destination = `/app/video-call/${message.type}`;
        this.sendMessage(destination, message);
    }

    disconnect() {
        this.stompClient?.deactivate();
        this.stompClient = null;
    }

    get isConnected(): boolean {
        return this.stompClient?.connected || false;
    }
}

export default new SignalingService();
