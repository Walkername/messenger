import { useState } from "react";
import { login } from "../../api/auth-api";
import type { AuthRequest } from "../../types/auth/auth-request";
import { useNavigate } from "react-router-dom";
import "./login-page.css";

export default function LoginPage() {
    const navigate = useNavigate();

    const [request, setRequest] = useState<AuthRequest>({
        username: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRequest((prev) => ({ ...prev, [name]: value }));
    };

    const handleLoginFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(request);
        login(request).then(() => {
            navigate("/");
        });
    };

    return (
        <div className="login-layout">
            <h1 className="login-layout-header">Sign In</h1>
            <form className="login-form" onSubmit={handleLoginFormSubmit}>
                <label htmlFor="username">Username</label>
                <input
                    className="login-form-username-input"
                    id="username"
                    name="username"
                    type="text"
                    onChange={handleChange}
                />

                <label htmlFor="password">Password</label>
                <input
                    className="login-form-password-input"
                    id="password"
                    name="password"
                    type="password"
                    onChange={handleChange}
                />

                <input className="login-form-submit-input" type="submit" value="Sign In" />
            </form>

            <a className="sign-up-ref" href="/register">
                Sign Up
            </a>
        </div>
    );
}
