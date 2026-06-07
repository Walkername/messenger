import { Outlet } from "react-router-dom";
import "./page-content.css";

export default function PageContent() {
    return (
        <div className="page-content">
            <Outlet />
        </div>
    );
}