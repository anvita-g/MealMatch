import React, { useState, useEffect } from "react";
import "./Preferences.css"; 
import SettingsTabs from "./SettingsTabs";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaSun,
  FaTruck,
  FaMapMarkerAlt,
} from "react-icons/fa";

function Preferences() {
  const [radius, setRadius] = useState(50);
  const [arrangement, setArrangement] = useState("pickup");
  const [tags, setTags] = useState([]);
  const [input, setInput] = useState("");
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [days, setDays] = useState(["M", "T", "W", "TH"]);
  const [times, setTimes] = useState(["MORNING", "AFTERNOON"]);

  const suggestions = ["Kosher", "Lactose Intolerance", "Pescetarian"];

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
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
          setLoading(false);
          return;
        }
        const docRef = profileSnapshot.docs[0].ref;
        const profileData = profileSnapshot.docs[0].data();
        setProfile(profileData);
        setDocId(docRef.id);

        setRadius(profileData.radius || 50);
        setArrangement(profileData.arrangement || "pickup");
        setTags(Array.isArray(profileData.tags) ? profileData.tags : []);
        setDays(Array.isArray(profileData.days) ? profileData.days : ["M", "T", "W", "TH"]);
        setTimes(Array.isArray(profileData.times) ? profileData.times : ["MORNING", "AFTERNOON"]);
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

  const handleSave = async () => {
    if (!docId || !role) return;
    try {
      const docRef = doc(db, role + "s", docId);
      await updateDoc(docRef, {
        radius,
        arrangement,
        tags,
        days,
        times,
      });
      setProfile({ ...profile, radius, arrangement, tags, days, times });
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const toggleTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddTag = () => {
    if (input && !tags.includes(input)) {
      setTags([...tags, input]);
    }
    setInput("");
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

        <div className="profile-section">
          <h4>AVAILABILITY</h4>
          <div className="preference-flex">
            <div>
              <p><strong>Days of the week</strong></p>
              <div className="tags">
                {["M", "T", "W", "TH", "F", "SA", "SN"].map((d) => (
                  <span
                    key={d}
                    className={`tag ${days.includes(d) ? "" : "inactive"}`}
                    onClick={() =>
                      setDays((prev) =>
                        prev.includes(d) ? prev.filter((day) => day !== d) : [...prev, d]
                      )
                    }
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p><strong>Time of Day</strong></p>
              <div className="tags">
                {["MORNING", "AFTERNOON", "EVENING"].map((t) => (
                  <span
                    key={t}
                    className={`tag ${times.includes(t) ? "" : "inactive"}`}
                    onClick={() =>
                      setTimes((prev) =>
                        prev.includes(t) ? prev.filter((time) => time !== t) : [...prev, t]
                      )
                    }
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h4>RADIUS</h4>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="radius-slider"
          />
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
            <span
              className={`tag ${arrangement === "delivery" ? "" : "inactive"}`}
              onClick={() => setArrangement("delivery")}
            >
              DELIVERY
            </span>
            <span
              className={`tag ${arrangement === "pickup" ? "" : "inactive"}`}
              onClick={() => setArrangement("pickup")}
            >
              PICKUP
            </span>
          </div>
        </div>

        <div className="profile-section">
          <h4>TAGS</h4>
          <div className="tag-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter tag"
              list="tag-suggestions"
            />
            <button onClick={handleAddTag}>Add</button>
            <datalist id="tag-suggestions">
              {suggestions
                .filter((s) => s.toLowerCase().includes(input.toLowerCase()))
                .map((s) => (
                  <option key={s} value={s} />
                ))}
            </datalist>
          </div>

          <div className="tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}{" "}
                <span className="remove-x" onClick={() => toggleTag(tag)}>
                  ✕
                </span>
              </span>
            ))}
          </div>
        </div>

        <button className="save-button" onClick={handleSave}>Save Preferences</button>
      </div>
    </div>
  );
}

export default Preferences;
