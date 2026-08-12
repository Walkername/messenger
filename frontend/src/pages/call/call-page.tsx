// App.tsx
import { useCallback, useState } from "react";
import VideoCall from "../../components/call/video-call/video-call";
import getClaimFromToken from "../../utils/token-validation";
import { authService } from "../../services/auth-service";
import { useSearchParams } from "react-router-dom";

export default function CallPage() {
    const [searchParams] = useSearchParams();
    const withParam = searchParams.get("with");

    const token = authService.getToken()!;
    const accountId: string = String(getClaimFromToken(token, "id"));
    const [callWith, setCallWith] = useState<string | undefined>(
        withParam || undefined,
    );

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
        </div>
    );
}
