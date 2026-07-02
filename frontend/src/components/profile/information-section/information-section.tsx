import { useEffect, useState } from "react";
import "./information-section.css";
import type { ProfileResponse } from "../../../types/profile/profile-response";
import { formatTimeLong } from "../../../utils/validation-time";
import type { UpdateFirstNameRequest } from "../../../types/profile/update-firstname-request";
import type { UpdateUsernameRequest } from "../../../types/profile/update-username-request";
import { profileService } from "../../../services/profile-service";

export default function InformationSection() {
    const [profile, setProfile] = useState<ProfileResponse>();

    const [usernameInput, setUsernameInput] = useState<string>("");
    const [firstNameInput, setFirstNameInput] = useState<string>("");

    useEffect(() => {
        profileService.getMyProfile().then((data) => {
            setProfile(data);
            setUsernameInput(data.username);
            setFirstNameInput(data.firstName || "");
        });
    }, []);

    const updateUsername = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const request: UpdateUsernameRequest = {
            username: usernameInput,
        };
        profileService.updateMyProfileUsername(request).then((data) => {
            setProfile(data);
            setUsernameInput(data.username);
            setFirstNameInput(data.firstName || "");
        });
    };

    const updateFirstName = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const request: UpdateFirstNameRequest = {
            firstName: firstNameInput,
        };
        profileService.updateMyProfileFirstName(request).then((data) => {
            setProfile(data);
            setUsernameInput(data.username);
            setFirstNameInput(data.firstName);
        });
    };

    return (
        profile && (
            <div className="profile-info-section">
                <div className="profile-info-header">
                    <span className="profile-info-firstname">
                        {profile.firstName}
                    </span>
                    <div className="profile-info-ids">
                        <span className="profile-info-username">
                            @{profile.username}
                        </span>
                        <span className="profile-info-account-id">
                            ID: {profile.accountId}
                        </span>
                    </div>
                    <div className="profile-info-timestamps">
                        <span className="profile-info-created-at">
                            Created at: {formatTimeLong(profile.createdAt)}
                        </span>
                        <span className="profile-info-updated-at">
                            Updated at: {formatTimeLong(profile.updatedAt)}
                        </span>
                    </div>
                </div>

                <div className="profile-info-edit">
                    <form
                        className="profile-info-username-form"
                        onSubmit={updateUsername}
                    >
                        <label className="profile-info-username-label">
                            Username
                        </label>
                        <input
                            className="profile-info-username-input"
                            value={usernameInput}
                            onChange={(e) => {
                                setUsernameInput(e.target.value);
                            }}
                            type="text"
                        />
                        <input
                            className="profile-info-username-submit"
                            type="submit"
                            value="Save"
                        />
                    </form>

                    <form
                        className="profile-info-firstname-form"
                        onSubmit={updateFirstName}
                    >
                        <label className="profile-info-firstname-label">
                            First Name
                        </label>
                        <input
                            className="profile-info-firstname-input"
                            value={firstNameInput}
                            onChange={(e) => {
                                setFirstNameInput(e.target.value);
                            }}
                            type="text"
                        />
                        <input
                            className="profile-info-firstname-submit"
                            type="submit"
                            value="Save"
                        />
                    </form>
                </div>
            </div>
        )
    );
}
