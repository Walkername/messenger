import { NavLink, Outlet } from "react-router-dom";
import "./profile-page.css";
import type { ReactElement } from "react";
import { Info, ShieldCheck } from "lucide-react";

type TabOption = "information" | "security";

const TAB_CONFIG: Record<TabOption, { label: ReactElement; path: string }> = {
    information: {
        label: (
            <>
                <Info />
                Information
            </>
        ),
        path: "information",
    },
    security: {
        label: (
            <>
                <ShieldCheck />
                Security
            </>
        ),
        path: "security",
    },
};

export default function ProfilePage() {
    return (
        <div className="profile-layout">
            <aside className="profile-sidebar">
                <nav className="profile-sidebar-nav">
                    {(Object.keys(TAB_CONFIG) as TabOption[]).map((tab) => (
                        <NavLink
                            key={tab}
                            to={`/profile/${TAB_CONFIG[tab].path}`}
                            className={({ isActive }) =>
                                `profile-sidebar-btn ${isActive ? "active" : ""}`
                            }
                        >
                            {TAB_CONFIG[tab].label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="current-profile-option">
                <Outlet />
            </main>
        </div>
    );
}
