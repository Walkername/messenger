import { useCallback, useState } from "react";
import VideoCall from "../../components/call/video-call/video-call";
import getClaimFromToken from "../../utils/token-validation";
import { authService } from "../../services/auth-service";
import { useSearchParams } from "react-router-dom";
import "./call-page.css";

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
        <div className="call-page-layout">
            <VideoCall
                accountId={accountId}
                remoteUserId={callWith}
                onCallEnded={handleCallEnded}
            />
        </div>
    );
}
