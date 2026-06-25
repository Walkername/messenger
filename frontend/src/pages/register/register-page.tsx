import { useState } from "react";
import { register } from "../../api/auth-api";
import type { AuthRequest } from "../../types/auth/auth-request";

export default function RegisterPage() {
    const [request, setRequest] = useState<AuthRequest>({
        username: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRequest((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegisterFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        register(request).then((data) => {
            console.log(data);
        });
    };

    return (
        <>
            <h1>Register</h1>
            <form className="register-form" onSubmit={handleRegisterFormSubmit}>
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

                <label htmlFor="password-confirmation">
                    Password confirmation:
                </label>
                <br></br>
                <input
                    id="password-confirmation"
                    name="password-confirmation"
                    type="password"
                    onChange={handleChange}
                />
                <br></br>

                <input type="submit" />
            </form>

            <div>
                <a href="/login">Sign In</a>
            </div>
        </>
    );
}
