import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePreLogin from "./pages/home/HomePreLogin";
import HomePostLogin from "./pages/home/HomePostLogin";
import Login from "./pages/login/Login";
import RestaurantLogin from "./pages/login/RestaurantLogin";
import ShelterLogin from "./pages/login/ShelterLogin";
import Confirmation from "./pages/home/Confirmation";
import MatchRequest from "./pages/match/MatchRequest";
import PostMatch from "./pages/tracking/Tracking";
import Profile from "./pages/settings/Profile";
import Preferences from "./pages/settings/Preferences";
import History from "./pages/settings/History";
import TermsConditions from "./pages/settings/TermsConditions";

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePreLogin />} />
                <Route path="/dashboard" element={<HomePostLogin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/restaurant-login" element={<RestaurantLogin />} />
                <Route path="/shelter-login" element={<ShelterLogin />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/match-request" element={<MatchRequest />} />
                <Route path="/tracking" element={<PostMatch />} />
                <Route path="/settings/profile" element={<Profile />} />
                <Route path="/settings/preferences" element={<Preferences />} />
                <Route path="/settings/history" element={<History />} />
                <Route path="/settings/terms" element={<TermsConditions />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;