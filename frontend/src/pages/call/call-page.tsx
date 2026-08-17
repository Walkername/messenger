import VideoCall from "../../components/call/video-call/video-call";
import { useSearchParams } from "react-router-dom";
import "./call-page.css";
import { useEffect, useState } from "react";
import { profileService } from "../../services/profile-service";
import type { ProfileResponse } from "../../types/profile/profile-response";

export default function CallPage() {
    const [searchParams] = useSearchParams();
    const withParam = searchParams.get("with");
    const accountId = parseInt(withParam!);

    const [profile, setProfile] = useState<ProfileResponse>();
    
    useEffect(() => {
        profileService.getProfile(accountId)
            .then((data) => {
                setProfile(data);
            });
    })

    return (
        <div className="call-page-layout">
            <VideoCall profile={profile} />
        </div>
    );
}
