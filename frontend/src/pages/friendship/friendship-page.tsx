import { NavLink, Outlet } from "react-router-dom";
import "./friendship-page.css";
import InviteAsFriend from "../../components/friendship/invite-as-friend/invite-as-friend";

type TabOption = "friends" | "incoming" | "outgoing";

const TAB_CONFIG: Record<TabOption, { label: string; path: string }> = {
    friends: {
        label: "Friends",
        path: "all",
    },
    incoming: {
        label: "Incoming invitations",
        path: "invitations/incoming",
    },
    outgoing: {
        label: "Outgoing invitations",
        path: "invitations/outgoing"
    },
};

export default function FriendsPage() {
    

    

    

    return (
        <div className="friendship-page-layout">
            <aside className="friendship-page-sidebar">
                <nav className="friendship-page-sidebar-nav">
                    {(Object.keys(TAB_CONFIG) as TabOption[]).map((tab) => (
                        <NavLink
                            key={tab}
                            to={`/friends/${TAB_CONFIG[tab].path}`}
                            className={({ isActive }) =>
                                `friendship-sidebar-btn ${isActive ? "active" : ""}`
                            }
                        >
                            {TAB_CONFIG[tab].label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="current-friendship-option">
                <InviteAsFriend />
                <Outlet />
            </main>
        </div>
    );
}
