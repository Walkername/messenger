import "./App.css";
import {
    Route,
    Routes,
    BrowserRouter as Router,
    Navigate,
} from "react-router-dom";
import Navigation from "./components/navigation/navigation";
import LoginPage from "./pages/login/login-page";
import ProfilePage from "./pages/profile/profile-page";
import RegisterPage from "./pages/register/register-page";
import PrivateRoute from "./utils/private-route";
import PageContent from "./components/page-content/page-content";
import MessengerPage from "./pages/messenger/messenger-page";
import SecuritySection from "./components/profile/security-section/security-section";
import InformationSection from "./components/profile/information-section/information-section";
import CallPage from "./pages/call/call-page";
import { useEffect } from "react";
import { useAuthStore } from "./auth/store";
import { apiClient } from "./api/client";
import FriendsPage from "./pages/friendship/friendship-page";
import websocketService from "./services/websocket-service";
import presenceService from "./services/presence-service";
import CallSystem from "./components/call/call-system/call-system";
import getClaimFromToken from "./utils/token-validation";
import { WebRTCProvider } from "./contexts/webrtc-context";

function App() {
    const setAccessToken = useAuthStore((state) => state.setAccessToken);
    const setAccountId = useAuthStore((state) => state.setAccountId);
    const setLoading = useAuthStore((state) => state.setLoading);

    useEffect(() => {
        apiClient
            .refreshToken()
            .then((token) => {
                setAccessToken(token);
                const accountId = getClaimFromToken(token, "id");
                setAccountId(accountId);
            })
            .catch(() => {
                setAccessToken(null);
                setAccountId(null);
            })
            .finally(() => {
                setLoading(false);
                websocketService.connect().then(() => {
                    presenceService.connect();
                });
            });
    }, [setAccessToken, setLoading, setAccountId]);

    return (
        <Router>
            <WebRTCProvider>
                <Navigation />
                <Routes>
                    <Route element={<PrivateRoute />}>
                        <Route element={<PageContent />}>
                            <Route path="/" element={<MessengerPage />} />
                            <Route path="/profile" element={<ProfilePage />}>
                                <Route
                                    index
                                    element={
                                        <Navigate
                                            to="/profile/information"
                                            replace
                                        />
                                    }
                                />

                                <Route
                                    path="information"
                                    element={<InformationSection />}
                                />
                                <Route
                                    path="security"
                                    element={<SecuritySection />}
                                />

                                <Route
                                    path="*"
                                    element={
                                        <Navigate
                                            to="/profile/information"
                                            replace
                                        />
                                    }
                                />
                            </Route>
                            <Route
                                path="/chats/:id"
                                element={<MessengerPage />}
                            />

                            <Route path="/friends" element={<FriendsPage />} />
                        </Route>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>
                    <Route path="/call" element={<CallPage />} />
                </Routes>

                <CallSystem />
            </WebRTCProvider>
        </Router>
    );
}

export default App;
