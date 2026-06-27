import { Link } from "react-router-dom";
import "./navigation.css";

export default function Navigation() {
    const handleLogout = () => {
        localStorage.clear();
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
                <Link className="nav-bar-element" to="/call">
                    Call
                </Link>
                <Link
                    className="nav-bar-auth-element"
                    to="/login"
                    onClick={handleLogout}
                >
                    Log out
                </Link>
            </ul>
        </nav>
    );
}
