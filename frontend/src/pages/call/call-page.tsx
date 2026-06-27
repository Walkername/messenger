// App.tsx
import { useCallback, useState } from "react";
import VideoCall from "../../components/call/video-call/video-call";
import getClaimFromToken from "../../utils/token-validation";

export default function CallPage() {
    const token = localStorage.getItem("accessToken");
    const accountId: string = String(getClaimFromToken(token, "id"));
    const [idToCall, setIdToCall] = useState<string>("");
    const [callWith, setCallWith] = useState<string | undefined>(undefined);

    const handleCallEnded = useCallback(() => {
        setCallWith(undefined);
    }, []);

    return (
        <div className="app">
            <h1>Call-messenger</h1>
            <p>
                Your id: <strong>{accountId}</strong>
            </p>

            <div className="call-container">
                <VideoCall
                    accountId={accountId}
                    remoteUserId={callWith}
                    onCallEnded={handleCallEnded}
                />
            </div>

            <div className="call-actions">
                <input
                    type="text"
                    placeholder="Type ID to call"
                    onChange={(e) => setIdToCall(e.target.value)}
                />
                <button
                    onClick={() => {
                        const id = (
                            document.querySelector("input") as HTMLInputElement
                        )?.value;
                        if (id) setCallWith(idToCall);
                    }}
                >
                    Call
                </button>
            </div>
        </div>
    );
}
