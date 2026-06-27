import { Client } from "@stomp/stompjs";
import getClaimFromToken from "../utils/token-validation";

class WebRTCService {
    private stompClient: Client | null = null;

    private token: string | null = null;

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.token = localStorage.getItem("accessToken");
            const accountId = getClaimFromToken(this.token!, "id");
            this.stompClient = new Client({
                brokerURL: import.meta.env.VITE_BACKEND_WEBSOCKET_URL,
                connectHeaders: {
                    Authorization: `Bearer ${this.token}`,
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,

                onConnect: () => {
                    console.log("✅ WebSocket connected");

                    this.stompClient?.subscribe(
                        `/topic/call/${accountId}`,
                        (msg) => {
                            const data = JSON.parse(msg.body);
                            console.log(data);
                        },
                    );

                    this.stompClient?.subscribe("/topic/active", (msg) => {
                        console.log(msg.body);
                    });

                    if (this.stompClient?.connected) {
                        this.stompClient.publish({
                            destination: "/register",
                            body: JSON.stringify(accountId),
                        });
                    } else {
                        console.warn("WebSocket not connected");
                    }

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

    disconnect() {
        this.stompClient?.deactivate();
        this.stompClient = null;
    }

    get isConnected(): boolean {
        return this.stompClient?.connected || false;
    }
}

export default WebRTCService;
