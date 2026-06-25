import { useState } from "react";
import { login } from "../../api/auth-api";
import type { AuthRequest } from "../../types/auth/auth-request";
import { useNavigate } from "react-router-dom";

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
        <>
            <h1>Login</h1>
            <form className="login-form" onSubmit={handleLoginFormSubmit}>
                <label htmlFor="username">Username:</label>
                <br></br>
                <input
                    id="username"
                    name="username"
                    type="text"
                    onChange={handleChange}
                />
                <br></br>

                <label htmlFor="password">Password:</label>
                <br></br>
                <input
                    id="password"
                    name="password"
                    type="password"
                    onChange={handleChange}
                />
                <br></br>

                <input type="submit" />
            </form>

            <div>
                <a href="/register">Sign Up</a>
            </div>
        </>
    );
}
