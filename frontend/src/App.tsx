import "./App.css";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import Navigation from "./components/navigation/navigation";
import LoginPage from "./pages/login/login-page";
import ProfilePage from "./pages/profile/profile-page";
import RegisterPage from "./pages/register/register-page";
import PrivateRoute from "./utils/private-route";
import PageContent from "./components/page-content/page-content";
import MessengerPage from "./pages/messenger/messenger-page";

function App() {
    return (
        <Router>
            <Navigation />
            <Routes>
                <Route element={<PageContent />}>
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<MessengerPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/chats/:id" element={<MessengerPage />} />
                    </Route>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
