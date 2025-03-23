import "./Profile.css";
import { FaPhoneAlt, FaEnvelope, FaCalendarAlt, FaSun, FaTruck, FaMapMarkerAlt } from "react-icons/fa";

function Profile() {
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
        <div className="profile-tabs">
          <span className="tab active">Profile</span>
          <span className="tab">Preferences</span>
          <span className="tab">History</span>
          <span className="tab">Reviews</span>
          <span className="tab">T&C</span>
        </div>

        <div className="profile-header">
          <div>
            <h2>Condado</h2>
            <p><FaMapMarkerAlt className="icon" /> Ann Arbor, MI</p>
            <span className="status-badge">Active</span>
          </div>
          <button className="edit-button">EDIT</button>
        </div>

        <div className="profile-section">
          <h4>CONTACT INFORMATION</h4>
          <p><strong>Primary Name:</strong> Kaelyn Long</p>
          <p><strong>Phone Number:</strong> <span className="highlight">+1 123 456 7890</span></p>
          <p><strong>E-mail Address:</strong> <span className="highlight">condado@gmail.com</span></p>
          <p><strong>Address:</strong> 401 E Liberty St #200, Ann Arbor, MI 48104</p>
          <p><strong>Website:</strong> <span className="highlight">www.condado.com</span></p>
        </div>

        <div className="profile-section">
          <h4>ACCOUNT</h4>
          <p><strong>Username:</strong> condadoannarbor</p>
          <p><strong>Password:</strong> ●●●●●●●●●●</p>
        </div>

        <button className="logout-button">LOG OUT</button>
      </div>
    </div>
  );
}

export default Profile;