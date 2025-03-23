import { useNavigate, useLocation } from "react-router-dom";
import "./SettingsTabs.css"; // ✅ now uses its own styles

function SettingsTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="profile-tabs">
      <span
        className={`tab ${location.pathname === "/settings/profile" ? "active" : ""}`}
        onClick={() => navigate("/settings/profile")}
      >
        Profile
      </span>
      <span
        className={`tab ${location.pathname === "/settings/preferences" ? "active" : ""}`}
        onClick={() => navigate("/settings/preferences")}
      >
        Preferences
      </span>
      <span
        className={`tab ${location.pathname === "/settings/terms" ? "active" : ""}`}
        onClick={() => navigate("/settings/terms")}
      >
        T&C
      </span>
    </div>
  );
}

export default SettingsTabs;
