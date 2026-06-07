import "./App.css";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import Navigation from "./components/navigation/navigation";
import LoginPage from "./pages/login/login-page";
import ProfilePage from "./pages/profile/profile-page";
import RegisterPage from "./pages/register/register-page";
import PrivateRoute from "./utils/private-route";
import ChatPage from "./pages/chat/chat-page";
import PageContent from "./components/page-content/page-content";
import ChatLayout from "./components/chat/chat-layout/chat-layout";

function App() {
    return (
        <Router>
            <Navigation />
            <Routes>
                <Route element={<PageContent />}>
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<ChatLayout />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/chats/{id}" element={<ChatPage />} />
                    </Route>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
