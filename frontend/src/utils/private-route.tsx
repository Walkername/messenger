import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../auth/store";

export default function PrivateRoute() {
    const { accessToken, isLoading } = useAuthStore();

    if (isLoading) {
        return <div></div>;
    }

    return accessToken ? <Outlet /> : <Navigate to="/login" />;
}
