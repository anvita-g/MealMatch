import React, { useState, useEffect } from "react";
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
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [docId, setDocId] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [editableData, setEditableData] = useState({
    name: "",
    phone: "",
    address: "",
    website: "",
  });

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
        const docRef = profileSnapshot.docs[0].ref;
        const profileData = profileSnapshot.docs[0].data();
        setProfile(profileData);
        setDocId(docRef.id);

        setEditableData({
          name: profileData.name || "",
          phone: profileData.phoneNumber || "",
          address: profileData.address || "",
          website: profileData.website || "",
        });
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

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    setEditableData({ ...editableData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!docId || !role) return;
    try {
      const docRef = doc(db, role + "s", docId);
      await updateDoc(docRef, {
        name: editableData.name,
        phoneNumber: editableData.phone,
        address: editableData.address,
        website: editableData.website,
      });
      setProfile({ ...profile, name: editableData.name, phoneNumber: editableData.phone, address: editableData.address, website: editableData.website });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
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
    {profile.arrangement || "Pickup Only"}
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

        <div className="profile-header">
          <div>
            <h2>{profile.name}</h2>
            <p>
              <FaMapMarkerAlt className="icon" /> {profile.address || "No Address"}
            </p>
            <span className="status-badge">Active</span>
          </div>
          {isEditing ? (
            <button className="edit-button" onClick={handleSave}>
              SAVE
            </button>
          ) : (
            <button className="edit-button" onClick={toggleEdit}>
              EDIT
            </button>
          )}
        </div>

        <div className="profile-section">
          <h4>CONTACT INFORMATION</h4>
          <p>
            <strong>Primary Name:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editableData.name}
                onChange={handleChange}
                className="editable-input"
              />
            ) : (
              profile.name
            )}
          </p>
          <p>
            <strong>Phone Number:</strong>{" "}
            <span className="highlight">
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={editableData.phone}
                  onChange={handleChange}
                  className="editable-input"
                />
              ) : (
                profile.phoneNumber || "No Phone"
              )}
            </span>
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={editableData.address}
                onChange={handleChange}
                className="editable-input"
              />
            ) : (
              profile.address || "No Address"
            )}
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <span className="highlight">
              {isEditing ? (
                <input
                  type="text"
                  name="website"
                  value={editableData.website}
                  onChange={handleChange}
                  className="editable-input"
                />
              ) : (
                profile.website || "No Website"
              )}
            </span>
          </p>
        </div>

        <div className="profile-section">
          <h4>ACCOUNT</h4>
          <p>
            <strong>E-mail Address:</strong>{" "}
            <span className="highlight">{profile.email}</span>
          </p>
          <p>
            <strong>Password:</strong> ●●●●●●●●●●
          </p>
        </div>

        <button className="logout-button" onClick={() => navigate("/")}>
          LOG OUT
        </button>
      </div>
    </div>
  );
}

export default Profile;
