import { Client } from "@stomp/stompjs";
import type { SignalingMessage } from "../types/call/webrtc";
import { authService } from "./auth-service";

type MessageHandler = (message: any) => void;

class WebSocketService {
    private stompClient: Client | null = null;
    private subscriptions: Map<
        string,
        {
            subscription: any;
            handler: MessageHandler;
            destination: string;
        }
    > = new Map();

    private handlers: {
        signaling?: (message: SignalingMessage) => void;
    } = {};

    private isConnected = false;
    private connectPromise: Promise<void> | null = null;
    private pendingSubscriptions: Array<{
        destination: string;
        handler: MessageHandler;
        resolve: (subscriptionId: string) => void;
        reject: (error: any) => void;
    }> = [];

    connect(): Promise<void> {
        if (this.isConnected) {
            return Promise.resolve();
        }

        if (this.connectPromise) {
            return this.connectPromise;
        }

        this.connectPromise = new Promise((resolve, reject) => {
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
                    this.connectPromise = null;

                    this.subscribeToGlobalTopics();

                    this.processPendingSubscriptions();

                    resolve();
                },

                onDisconnect: () => {
                    console.log("❌ WebSocket disconnected");
                    this.isConnected = false;
                },

                onStompError: (error) => {
                    console.error("STOMP error:", error);
                    this.connectPromise = null;
                    reject(error);
                },
            });

            this.stompClient.activate();
        });

        return this.connectPromise;
    }

    private processPendingSubscriptions() {
        const pending = [...this.pendingSubscriptions];
        this.pendingSubscriptions = [];

        for (const sub of pending) {
            try {
                const subscriptionId = this.doSubscribe(
                    sub.destination,
                    sub.handler,
                );
                sub.resolve(subscriptionId);
            } catch (error) {
                sub.reject(error);
            }
        }
    }

    private findExistingSubscription(destination: string): string | null {
        for (const [id, sub] of this.subscriptions.entries()) {
            if (sub.destination === destination) {
                return id;
            }
        }
        return null;
    }

    private doSubscribe(destination: string, handler: MessageHandler): string {
        if (!this.stompClient?.connected) {
            throw new Error("WebSocket not connected");
        }

        const existingId = this.findExistingSubscription(destination);
        if (existingId) {
            console.log(
                `ℹ️ Already subscribed to ${destination}, reusing existing subscription`,
            );
            const existing = this.subscriptions.get(existingId);
            if (existing) {
                existing.handler = handler;
            }
            return existingId;
        }

        const subscription = this.stompClient.subscribe(destination, handler);
        const subscriptionId = `${destination}_${Date.now()}`;

        this.subscriptions.set(subscriptionId, {
            subscription,
            handler,
            destination,
        });

        console.log(
            `✅ Subscription done (ID: ${subscriptionId})`,
        );

        return subscriptionId;
    }

    private subscribeToGlobalTopics() {
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

    subscribeToTopic(
        destination: string,
        handler: MessageHandler,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.isConnected && this.stompClient?.connected) {
                try {
                    const subscriptionId = this.doSubscribe(
                        destination,
                        handler,
                    );
                    resolve(subscriptionId);
                } catch (error) {
                    reject(error);
                }
                return;
            }

            const pendingExists = this.pendingSubscriptions.some(
                (sub) => sub.destination === destination,
            );
            if (pendingExists) {
                console.log(
                    `ℹ️ Subscription to ${destination} already pending`,
                );
                const pending = this.pendingSubscriptions.find(
                    (sub) => sub.destination === destination,
                );
                if (pending) {
                    pending.handler = handler;
                }
            }

            this.pendingSubscriptions.push({
                destination,
                handler,
                resolve,
                reject,
            });

            if (!this.connectPromise && !this.isConnected) {
                this.connect().catch((error) => {
                    const pending = [...this.pendingSubscriptions];
                    this.pendingSubscriptions = [];
                    for (const sub of pending) {
                        sub.reject(error);
                    }
                });
            }
        });
    }

    unsubscribeFromTopic(subscriptionId: string) {
        if (!this.stompClient) {
            console.warn("WebSocket client not initialized");
            return;
        }

        const subscription = this.subscriptions.get(subscriptionId);
        if (subscription) {
            this.stompClient.unsubscribe(subscription.subscription.id);
            this.subscriptions.delete(subscriptionId);
            console.log(`✅ Unsubscribed from: ${subscriptionId}`);
        } else {
            console.warn(`Subscription ${subscriptionId} not found`);
        }
    }

    registerSignalingHandler(handler: (message: SignalingMessage) => void) {
        this.handlers.signaling = handler;
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
