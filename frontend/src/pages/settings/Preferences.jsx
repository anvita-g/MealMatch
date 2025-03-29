import React, { useState, useEffect, useRef } from "react";
import "./Preferences.css";
import SettingsTabs from "./SettingsTabs";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaSun,
  FaTruck,
} from "react-icons/fa";

function Preferences() {
  const [radius, setRadius] = useState(50);
  const [arrangement, setArrangement] = useState([]);
  const [tags, setTags] = useState([]);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(["M", "T", "W", "TH"]);
  const [times, setTimes] = useState(["MORNING", "AFTERNOON"]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);
  const tagOptions = [
    "Buddhist", "Dairy-Free", "Gluten-Free", "Halal", "Hindu",
    "Keto", "Kosher", "Low FODMAP", "Low Sodium", "Low Sugar",
    "Nut-Free", "Paleo", "Pescatarian", "Soy-Free", "Vegan", "Vegetarian"
  ];

  const radiusOptions = [5, 10, 25, 50, 100];

  const getRadiusIndex = () => radiusOptions.findIndex((r) => r === radius) || 0;

  const handleRadiusChange = (e) => {
    const index = parseInt(e.target.value);
    const snapped = radiusOptions[index];
    setRadius(snapped);
    saveUpdate("radius", snapped);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return setLoading(false);

      try {
        const usersQuery = query(
          collection(db, "users"),
          where("email", "==", currentUser.email)
        );
        const usersSnapshot = await getDocs(usersQuery);
        if (usersSnapshot.empty) return setLoading(false);

        const userData = usersSnapshot.docs[0].data();
        const userRole = userData.role;
        setRole(userRole);

        const profileQuery = query(
          collection(db, userRole + "s"),
          where("email", "==", currentUser.email)
        );
        const profileSnapshot = await getDocs(profileQuery);
        if (profileSnapshot.empty) return setLoading(false);

        const docRef = profileSnapshot.docs[0].ref;
        const profileData = profileSnapshot.docs[0].data();
        setProfile(profileData);
        setDocId(docRef.id);

        setRadius(profileData.radius || 50);
        setArrangement(profileData.arrangement || []);
        setTags(Array.isArray(profileData.tags) ? profileData.tags : []);
        setDays(Array.isArray(profileData.days) ? profileData.days : ["M", "T", "W", "TH"]);
        setTimes(Array.isArray(profileData.times) ? profileData.times : ["MORNING", "AFTERNOON"]);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchProfile();
      else setProfile(null);
    });

    return () => unsubscribe();
  }, []);

  const saveUpdate = async (field, value) => {
    if (!docId || !role) return;
    try {
      const docRef = doc(db, role + "s", docId);
      await updateDoc(docRef, { [field]: value });
    } catch (error) {
      console.error("Error updating:", field, error);
    }
  };

  const handleDayClick = (d) => {
    const updated = days.includes(d) ? days.filter((x) => x !== d) : [...days, d];
    setDays(updated);
    saveUpdate("days", updated);
  };

  const handleTimeClick = (t) => {
    const updated = times.includes(t) ? times.filter((x) => x !== t) : [...times, t];
    setTimes(updated);
    saveUpdate("times", updated);
  };

  const handleArrangementClick = (type) => {
    const updated = arrangement.includes(type)
      ? arrangement.filter((a) => a !== type)
      : [...arrangement, type];
    setArrangement(updated);
    saveUpdate("arrangement", updated);
  };

  const handleTagSelect = async (selectedTag) => {
    const updated = [...tags, selectedTag];
    setTags(updated);
    setShowDropdown(false);
    await saveUpdate("tags", updated);
  };

  const toggleTag = async (tag) => {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    await saveUpdate("tags", updated);
  };

  const formatArrangementText = () => {
    if (arrangement.includes("delivery") && arrangement.includes("pickup")) {
      return "Delivery, Pickup";
    }
    if (arrangement.includes("delivery")) return "Delivery";
    if (arrangement.includes("pickup")) return "Pickup";
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
          <p><FaPhoneAlt className="icon" /> {profile.phoneNumber || "No Phone"}</p>
          <p><FaEnvelope className="icon" /> {profile.email}</p>
        </div>

        <div className="section">
          <h4>AVAILABILITY</h4>
          <p><FaCalendarAlt className="icon" /> {Array.isArray(profile.days) ? profile.days.join(", ") : "Not set"}</p>
          <p><FaSun className="icon" /> {Array.isArray(profile.times) ? profile.times.join(", ") : "Not set"}</p>
          <p><FaTruck className="icon" /> {formatArrangementText()}</p>
        </div>

        <div className="section">
          <h4>TAGS</h4>
          <div className="tags">
            {profile.tags
              ? Object.values(profile.tags).map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))
              : "No Tags"}
          </div>
        </div>

        <p className="preview-note">Preview: This page is displayed to others</p>
      </div>

      <div className="profile-main">
        <SettingsTabs />

        <div className="profile-section">
          <h4>AVAILABILITY</h4>
          <div className="preference-flex">
            <div>
              <p><strong>Days of the week</strong></p>
              <div className="tags">
                {["M", "T", "W", "TH", "F", "SA", "SN"].map((d) => (
                  <span key={d} className={`tag ${days.includes(d) ? "" : "inactive"}`} onClick={() => handleDayClick(d)}>{d}</span>
                ))}
              </div>
            </div>
            <div>
              <p><strong>Time of Day</strong></p>
              <div className="tags">
                {["MORNING", "AFTERNOON", "EVENING"].map((t) => (
                  <span key={t} className={`tag ${times.includes(t) ? "" : "inactive"}`} onClick={() => handleTimeClick(t)}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h4>RADIUS</h4>
          <input type="range" min="0" max="4" step="1" value={getRadiusIndex()} onChange={handleRadiusChange} className="radius-slider" />
          <div className="radius-labels">
            <span>5 Miles</span>
            <span>10 Miles</span>
            <span>25 Miles</span>
            <span>50 Miles</span>
            <span>&gt; 50 Miles</span>
          </div>
        </div>

        <div className="profile-section">
          <h4>ARRANGEMENT</h4>
          <div className="tags">
            {["delivery", "pickup"].map((type) => (
              <span
                key={type}
                className={`tag ${arrangement.includes(type) ? "" : "inactive"}`}
                onClick={() => handleArrangementClick(type)}
              >
                {type.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h4>TAGS</h4>
          <div className="custom-dropdown" ref={dropdownRef}>
            <div className="dropdown-trigger" onClick={() => setShowDropdown((prev) => !prev)}>
              Select a tag
            </div>
            {showDropdown && (
              <div className="dropdown-menu">
                {tagOptions
                  .filter((option) => !tags.includes(option))
                  .map((option) => (
                    <div key={option} className="dropdown-option" onClick={() => handleTagSelect(option)}>
                      {option}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag} <span className="remove-x" onClick={() => toggleTag(tag)}>✕</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preferences;
