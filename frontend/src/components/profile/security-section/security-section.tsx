import { useState } from "react";
import "./security-section.css";
import type { PasswordUpdateRequest } from "../../../types/security/security";
import { securityService } from "../../../services/security-service";

export default function SecuritySection() {
    const [status, setStatus] = useState<{
        message: string;
        fieldErrors: Record<string, string>;
        type: "success" | "error" | null;
    }>({
        message: "",
        fieldErrors: {},
        type: null,
    });

    const [oldPasswordInput, setOldPasswordInput] = useState<string>("");
    const [newPasswordInput, setNewPasswordInput] = useState<string>("");

    const handlePasswordUpdate = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const request: PasswordUpdateRequest = {
            oldPassword: oldPasswordInput,
            newPassword: newPasswordInput,
        };

        securityService
            .updatePassword(request)
            .then(() => {
                setStatus({
                    message: "Password has been updated successfully!",
                    fieldErrors: {},
                    type: "success",
                });
                setOldPasswordInput("");
                setNewPasswordInput("");
            })
            .catch((error) => {
                setStatus({
                    message: `${error.message}.`,
                    fieldErrors: error.data.fieldErrors,
                    type: "error",
                });
            });
    };

    return (
        <div className="profile-security-section">
            <div className="profile-security-edit">
                <form
                    className="profile-security-password-form"
                    onSubmit={handlePasswordUpdate}
                >
                    <label className="profile-security-old-password-label">
                        Old password
                    </label>
                    <input
                        className="profile-security-old-password-input"
                        value={oldPasswordInput}
                        onChange={(e) => setOldPasswordInput(e.target.value)}
                        type="text"
                        required
                    />

                    <label className="profile-security-new-password-label">
                        New password
                    </label>
                    <input
                        className="profile-security-new-password-input"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        type="text"
                        required
                    />

                    <input
                        className="profile-security-password-submit"
                        type="submit"
                        value="Update"
                    />

                    {status.message && (
                        <div
                            className={`profile-security-password-form-status ${status.type === "error" ? "error" : "success"}`}
                        >
                            {status.message}
                            {Object.entries(status.fieldErrors).map(
                                ([key, value]) => (
                                    <li className="password-status-field-error" key={key}>{value}</li>
                                ),
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
