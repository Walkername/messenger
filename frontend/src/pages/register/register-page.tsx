import { useState } from "react";
import { register } from "../../api/auth-api";
import type { AuthRequest } from "../../types/auth/auth-request";
import "./register-page.css";

export default function RegisterPage() {
    const [request, setRequest] = useState<AuthRequest>({
        username: "",
        password: "",
    });

    const [requestStatus, setRequestStatus] = useState<{
        message: string;
        type: "success" | "error" | null;
    }>({
        message: "",
        type: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRequest((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegisterFormSubmit = (
        e: React.SubmitEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        register(request)
            .then((data) => {
                console.log(data);
                setRequestStatus({
                    message:
                        "You have successfully registered and can log in to your account.",
                    type: "success",
                });
            })
            .catch((error) => {
                setRequestStatus({
                    message: `${error.message}.`,
                    type: "error",
                });
            });
    };

    return (
        <div className="register-layout">
            <h1 className="register-layout-header">Register</h1>
            <form className="register-form" onSubmit={handleRegisterFormSubmit}>
                <label htmlFor="username">Username</label>
                <input
                    className="register-form-username-input"
                    id="username"
                    name="username"
                    type="text"
                    onChange={handleChange}
                />

                <label htmlFor="password">Password</label>
                <input
                    className="register-form-password-input"
                    id="password"
                    name="password"
                    type="password"
                    onChange={handleChange}
                />

                <label htmlFor="password-confirmation">
                    Password confirmation
                </label>
                <input
                    className="register-form-password-confirmation-input"
                    id="password-confirmation"
                    name="password-confirmation"
                    type="password"
                    onChange={handleChange}
                />

                <input className="register-form-submit-input" type="submit" />
            </form>

            <a className="sign-in-ref" href="/login">
                Sign In
            </a>

            {requestStatus.message && (
                <div
                    className={`register-request-status ${requestStatus.type === "error" ? "error" : "success"}`}
                >
                    {requestStatus.message}
                </div>
            )}
        </div>
    );
}
