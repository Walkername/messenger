import { Navigate, NavLink, useSearchParams } from "react-router-dom";
import "./friendship-page.css";
import InviteAsFriend from "../../components/friendship/invite-as-friend/invite-as-friend";
import FriendsSection from "../../components/friendship/friends-section/friends-section";
import IncomingSection from "../../components/friendship/incoming-section/incoming-section";
import OutgoingSection from "../../components/friendship/outgoing-section/outgoing-section";

type Section = "all" | "incoming" | "outgoing";

const TAB_CONFIG: Record<Section, { label: string }> = {
    all: {
        label: "Friends",
    },
    incoming: {
        label: "Incoming invitations",
    },
    outgoing: {
        label: "Outgoing invitations",
    },
};

export default function FriendsPage() {
    const [searchParams] = useSearchParams();
    const section = searchParams.get("section");

    if (!section) {
        return <Navigate to="/friends?section=all" replace />;
    }

    return (
        <div className="friendship-page-layout">
            <aside className="friendship-page-sidebar">
                <nav className="friendship-page-sidebar-nav">
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
            <main className="current-friendship-option">
                <InviteAsFriend />
                {section === "all" && <FriendsSection />}
                {section === "online" && <FriendsSection />}
                {section === "incoming" && <IncomingSection />}
                {section === "outgoing" && <OutgoingSection />}
            </main>
        </div>
    );
}
