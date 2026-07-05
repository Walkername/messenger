import "./friends-section.css";
import { NavLink, useSearchParams } from "react-router-dom";
import AllFriendsList from "../all-friends-list/all-friends-list";
import OnlineFriendsList from "../online-friends-list/online-friends-list";

type Section = "all" | "online";

const TAB_CONFIG: Record<Section, { label: string }> = {
    all: {
        label: "All",
    },
    online: {
        label: "Online",
    },
};

export default function FriendsSection() {
    const [searchParams] = useSearchParams();
    const section = searchParams.get("section");

    return (
        <div className="friends-container">
            {section === "all" && <AllFriendsList />}
            {section === "online" && <OnlineFriendsList />}
            <aside className="friends-switches-sidebar">
                <nav className="friends-switches-sidebar-nav">
                    {Object.entries(TAB_CONFIG).map(([key, value]) => (
                        <NavLink
                            key={key}
                            to={`/friends?section=${key}`}
                            className={() =>
                                `friendship-sidebar-btn ${section === key ? "active" : ""}`
                            }
                        >
                            {value.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </div>
    );
}
