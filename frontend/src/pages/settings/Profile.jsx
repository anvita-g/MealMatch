import { useState } from "react";
import "./Profile.css";
import SettingsTabs from "./SettingsTabs";
import { useNavigate } from "react-router-dom";

import {
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaSun,
  FaTruck,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("Kaelyn Long");
  const [phone, setPhone] = useState("+1 123 456 7890");
  const [email, setEmail] = useState("condado@gmail.com");
  const [address, setAddress] = useState("401 E Liberty St #200, Ann Arbor, MI 48104");
  const [website, setWebsite] = useState("www.condado.com");
  const [username, setUsername] = useState("condadoannarbor");
  const [password, setPassword] = useState("●●●●●●●●●●");

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const renderField = (value, setter) => (
    isEditing ? (
      <input
        className="editable-input"
        value={value}
        onChange={(e) => setter(e.target.value)}
      />
    ) : (
      <span className="highlight">{value}</span>
    )
  );

  return (
    <div className="profile-page">
      <div className="profile-sidebar">
        <h2 className="restaurant-name">Condado</h2>
        <p className="restaurant-type">Restaurant</p>
        <p className="restaurant-location">Ann Arbor, MI</p>
        <span className="status-badge">Active</span>

        <div className="section">
          <h4>CONTACT INFORMATION</h4>
          <p><FaPhoneAlt className="icon" /> +1 123 456 7890</p>
          <p><FaEnvelope className="icon" /> condado@gmail.com</p>
        </div>

        <div className="section">
          <h4>AVAILABILITY</h4>
          <p><FaCalendarAlt className="icon" /> M, T, W, TH</p>
          <p><FaSun className="icon" /> Morning, Afternoon</p>
          <p><FaTruck className="icon" /> Pickup Only</p>
        </div>

        <div className="section">
          <h4>TAGS</h4>
          <div className="tags">
            <span className="tag">Vegan</span>
            <span className="tag">Halal</span>
            <span className="tag">Gluten Free</span>
          </div>
        </div>

        <p className="preview-note">Preview: This page is displayed to others</p>
      </div>

      <div className="profile-main">
        <SettingsTabs />

        <div className="profile-header">
          <div>
            <h2>Condado</h2>
            <p><FaMapMarkerAlt className="icon" /> Ann Arbor, MI</p>
            <span className="status-badge">Active</span>
          </div>
          <button className="edit-button" onClick={toggleEdit}>
            {isEditing ? "DONE" : "EDIT"}
          </button>
        </div>

        <div className="profile-section">
          <h4>CONTACT INFORMATION</h4>
          <p><strong>Primary Name:</strong> {renderField(name, setName)}</p>
          <p><strong>Phone Number:</strong> {renderField(phone, setPhone)}</p>
          <p><strong>E-mail Address:</strong> {renderField(email, setEmail)}</p>
          <p><strong>Address:</strong> {renderField(address, setAddress)}</p>
          <p><strong>Website:</strong> {renderField(website, setWebsite)}</p>
        </div>

        <div className="profile-section">
          <h4>ACCOUNT</h4>
          <p><strong>Username:</strong> {renderField(username, setUsername)}</p>
          <p><strong>Password:</strong> {renderField(password, setPassword)}</p>
        </div>

        <button className="logout-button" onClick={() => navigate("/")}>
            LOG OUT
        </button>
      </div>
    </div>
  );
}

export default Profile;