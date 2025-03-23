import "./TermsConditions.css";
import SettingsTabs from "./SettingsTabs";

function TermsConditions() {
  return (
    <div className="profile-page">
      <div className="profile-sidebar">
        <h2 className="restaurant-name">Condado</h2>
        <p className="restaurant-type">Restaurant</p>
        <p className="restaurant-location">Ann Arbor, MI</p>
        <span className="status-badge">Active</span>

        <div className="section">
          <h4>CONTACT INFORMATION</h4>
          <p>+1 123 456 7890</p>
          <p>condado@gmail.com</p>
        </div>

        <div className="section">
          <h4>AVAILABILITY</h4>
          <p>M, T, W, TH</p>
          <p>Morning, Afternoon</p>
          <p>Pickup Only</p>
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

        <div className="terms-content">
          <h2 className="terms-title">Terms of Service</h2>
          <p className="terms-updated">Last updated March 2025</p>
          <p>
            By using Meal Match, you agree to these Terms and Conditions. If you do not agree, you may not use the Platform. We will run a background check to confirm this is a real business to allow your account to be accepted.
          </p>

          <h4>1. Condition of Use</h4>
          <p>
            MealMatch facilitates business connections by revealing contact email information once a match between businesses is confirmed. All further communication between parties occurs off-platform. To proceed with connections, users must interact with designated stages on the Platform.
          </p>

          <h4>2. Privacy Policy</h4>
          <p>
            Users must provide accurate information when signing up. Users are responsible for their communications after a match is made. The Platform is not liable for any interactions, agreements, or disputes that arise between matched parties. Contact email information is only revealed upon mutual confirmation of a match. The Platform does not facilitate or monitor further communications between users.
          </p>

          <h4>3. Intellectual Property</h4>
          <p>
            MealMatch is not responsible for any damages, losses, or disputes resulting from user interactions after contact information has been shared. We reserve the right to modify these Terms and Conditions at any time. Continued use of the Platform constitutes acceptance of any changes.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsConditions;