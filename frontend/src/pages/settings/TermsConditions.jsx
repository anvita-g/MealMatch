import React, { useState, useEffect } from "react";
import "./TermsConditions.css";
import SettingsTabs from "./SettingsTabs";
import { FaPhoneAlt, FaEnvelope, FaCalendarAlt, FaSun, FaTruck, FaMapMarkerAlt } from "react-icons/fa";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

function TermsConditions() {
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error("No user logged in");
        setLoading(false);
        return;
      }

      try {
        const usersQuery = query(
          collection(db, "users"),
          where("email", "==", currentUser.email)
        );
        const usersSnapshot = await getDocs(usersQuery);
        if (usersSnapshot.empty) {
          console.error("User not found in users collection");
          setLoading(false);
          return;
        }

        const userData = usersSnapshot.docs[0].data();
        const userRole = userData.role;
        setRole(userRole);

        const profileQuery = query(
          collection(db, userRole + "s"),
          where("email", "==", currentUser.email)
        );
        const profileSnapshot = await getDocs(profileQuery);
        if (profileSnapshot.empty) {
          console.error("Profile not found in " + userRole + "s collection");
          setLoading(false);
          return;
        }

        const profileData = profileSnapshot.docs[0].data();
        setProfile(profileData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatArrangementText = () => {
    const a = profile.arrangement;
    if (!a || !Array.isArray(a)) return "Pickup Only";
    if (a.includes("delivery") && a.includes("pickup")) return "Delivery, Pickup";
    if (a.includes("delivery")) return "Delivery";
    if (a.includes("pickup")) return "Pickup";
    return "None";
  };  

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>Error loading profile.</p>;

  return (
    <div className="profile-page">
      <div className="profile-sidebar">
        <h2 className="restaurant-name">{profile.name}</h2>
        <p className="restaurant-type">{role === "restaurant" ? "Restaurant" : "Shelter"}</p>
        <p className="restaurant-location">{profile.address || "No Address"}</p>
        <span className="status-badge">Active</span>

        <div className="section">
          <h4>CONTACT INFORMATION</h4>
          <p>
            <FaPhoneAlt className="icon" /> {profile.phoneNumber || "No Phone"}
          </p>
          <p>
            <FaEnvelope className="icon" /> {profile.email}
          </p>
        </div>

        <div className="section">
          <h4>AVAILABILITY</h4>
          {profile.days && typeof profile.days === "object" ? (
            <p>
              <FaCalendarAlt className="icon" />
              {Object.values(profile.days).map((times, index) => (
                <span key={index}>
                  {Array.isArray(times) ? times.join(", ") : times}
                  {index < Object.values(profile.days).length - 1 && ", "}
                </span>
              ))}
            </p>
          ) : (
            <p>Availability not set</p>
          )}

          {profile.times && typeof profile.times === "object" ? (
            <p>
              <FaSun className="icon" />
              {Object.values(profile.times).map((value, index) => (
                <span key={index}>
                  {value || "N/A"}
                  {index < Object.values(profile.times).length - 1 && ", "}
                </span>
              ))}
            </p>
          ) : (
            <p>Time of day not set</p>
          )}
          <p>
            <FaTruck className="icon" />
            {formatArrangementText()}
          </p>
        </div>

        <div className="section">
          <h4>TAGS</h4>
          <div className="tags">
            {profile.tags
              ? Object.values(profile.tags).map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))
              : "No Tags"}
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
