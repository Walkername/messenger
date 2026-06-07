import { useEffect, useState } from "react";
import type { ProfileResponse } from "../../types/profile/profile-response";
import { getMyProfile, getProfile } from "../../api/profile-api";

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileResponse>();

    useEffect(() => {
        getMyProfile()
            .then((data) => {
                setProfile(data);
            })
    }, []);
    
    return (
        <>
            <h1>Profile</h1>
            <div>
                {
                    profile?.firstName
                }
            </div>
        </>
    );
}