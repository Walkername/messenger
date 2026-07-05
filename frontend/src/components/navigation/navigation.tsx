import { Link } from "react-router-dom";
import "./navigation.css";
import { useAuthStore } from "../../auth/store";

export default function Navigation() {
    const { accessToken } = useAuthStore();
    
    const handleLogout = () => {
        localStorage.clear();
        // TODO: send request to the backend
        // in order to delete refresh_token
        // also clear authStore
        // useAuthStore.getState().clearAuth();
    };

    return (
        <nav className="nav-bar">
            <ul className="nav-bar-content">
                <Link className="nav-bar-element" to="/">
                    Messenger
                </Link>
                <Link className="nav-bar-element" to="/profile">
                    Profile
                </Link>
                <Link className="nav-bar-element" to="/friends">
                    Friends
                </Link>
                <Link className="nav-bar-element" to="/call">
                    Call
                </Link>
                {
                    accessToken && <Link
                        className="nav-bar-auth-element"
                        to="/login"
                        onClick={handleLogout}
                    >
                        Log out
                    </Link>
                }
            </ul>
        </nav>
    );
}
