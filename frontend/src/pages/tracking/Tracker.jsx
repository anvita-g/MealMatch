import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaCalendarAlt, FaSun, FaTruck } from "react-icons/fa";
import "./Tracker.css";

const Tracker = () => {
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [role, setRole] = useState(null);
  const [confirmationSurvey, setConfirmationSurvey] = useState({
    deliveryDate: "",
    time: "",
    foodRequirements: "",
    transportationNotes: "",
    foodStorageNotes: ""
  });
  const [confirmation, setConfirmation] = useState(false);
  const [pickup, setPickup] = useState(false);
  const [received, setReceived] = useState(false);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [comments, setComments] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const usersQuery = query(collection(db, "users"), where("email", "==", currentUser.email));
        const usersSnapshot = await getDocs(usersQuery);
        if (usersSnapshot.empty) {
          setLoading(false);
          return;
        }
        const userData = usersSnapshot.docs[0].data();
        setRole(userData.role);
        const currentRole = userData.role;
        const oppositeRole = currentRole === "restaurant" ? "shelter" : "restaurant";
        const matchQuery = query(
          collection(db, "matches"),
          where(`${currentRole}Email`, "==", currentUser.email),
          where("restaurantRequest", "==", true),
          where("shelterRequest", "==", true)
        );
        const matchSnapshot = await getDocs(matchQuery);
        if (!matchSnapshot.empty) {
          const matchDoc = matchSnapshot.docs[0];
          const matchDocData = matchDoc.data();
          const oppositeEmail = matchDocData[`${oppositeRole}Email`];
          const oppositeQuery = query(
            collection(db, `${oppositeRole}s`),
            where("email", "==", oppositeEmail)
          );
          const oppositeSnapshot = await getDocs(oppositeQuery);
          if (!oppositeSnapshot.empty) {
            const oppositeData = oppositeSnapshot.docs[0].data();
            setMatchData({ ...oppositeData, matchId: matchDoc.id });
          }
        }
      } catch (error) {
        console.error("Error fetching match:", error);
      }
      setLoading(false);
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchMatch();
      } else {
        setMatchData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchConfirmation = async () => {
      if (!matchData?.matchId) return;
      try {
        const confirmationRef = doc(db, "confirmation", matchData.matchId);
        const confirmationSnap = await getDoc(confirmationRef);
        if (confirmationSnap.exists()) {
          setConfirmationSurvey(confirmationSnap.data());
        }
      } catch (error) {
        console.error("Error fetching confirmation:", error);
      }
    };
    fetchConfirmation();
  }, [matchData]);

  const handleSaveConfirmation = async () => {
    if (!matchData?.matchId) return;
    try {
      const confirmationRef = doc(db, "confirmation", matchData.matchId);
      await setDoc(confirmationRef, { ...confirmationSurvey, matchId: matchData.matchId }, { merge: true });
      alert("Confirmation saved!");
    } catch (error) {
      console.error("Error saving confirmation:", error);
      alert("Error saving confirmation");
    }
  };

  const handleCancel = async () => {
    if (!matchData?.matchId) return;
    try {
      const matchRef = doc(db, "matches", matchData.matchId);
      await updateDoc(matchRef, { restaurantRequest: false, shelterRequest: false });
      setMatchData(null);
    } catch (error) {
      console.error("Error cancelling match:", error);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "feedback"), {
        name,
        id,
        comments,
        rating,
        timestamp: new Date()
      });
      alert("Feedback submitted!");
      setName("");
      setId("");
      setComments("");
      setRating(0);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback");
    }
  };

  if (loading) return <p>Loading matches...</p>;

  return (
    <div className="tracker-container">
      <section className="tracker-section">
        <div className="heading">
          <h1 style={{ fontSize: "5em" }}>01</h1>
          <h1 style={{ fontSize: "2em" }}>Review Your Match</h1>
        </div>
        <div className="match-review">
          {matchData ? (
            <div className="match-card">
              <h2>{matchData.name || "No Name"}</h2>
              <span className="status-badge">Active</span>
              <div className="card-body">
                <p className="description">{matchData.description || "No Description"}</p>
                <p><strong>Address:</strong> {matchData.address || "No Address"}</p>
                <p><strong>Email:</strong> {matchData.email || "No Email"}</p>
                <p><strong>Phone:</strong> {matchData.phoneNumber || "No Phone"}</p>
                <p>
                  <strong>Website:</strong> <span className="highlight">{matchData.website || "No Website"}</span>
                </p>
                <hr />
                <h4>AVAILABILITY</h4>
                <p><FaCalendarAlt className="icon" /> {Array.isArray(matchData.days) ? matchData.days.join(", ") : "No Days"}</p>
                <p><FaSun className="icon" /> {Array.isArray(matchData.times) ? matchData.times.join(", ") : "No Times"}</p>
                <p><FaTruck className="icon" /> {matchData.arrangement || "Not specified"}</p>
                <hr />
                <h4>TAGS</h4>
                <div className="tags">
                  {(matchData.tags || []).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>No match found.</p>
          )}
          <div className="match-actions">
            <p>Can't proceed with this match?</p>
            <p>Please cancel promptly.</p>
            <button onClick={handleCancel}>CANCEL</button>
          </div>
        </div>
      </section>
      <section className="tracker-section">
        <div className="heading">
          <h1 style={{ fontSize: "5em" }}>02</h1>
          <h1 style={{ fontSize: "2em" }}>Discuss the Details</h1>
        </div>
        <div className="details-discussion">
          <div className="logistics">
            <h3>📞 Discuss Logistics</h3>
            <li>✔ Food Preferences & Limitations</li>
            <li>✔ Labeling, Packing & Storage Requirements</li>
            <li>✔ Scheduling Details (Day & Time)</li>
            <li>✔ Transportation Plan</li>
          </div>
          <div className="confirmation-survey">
            <h3>Confirmation Survey</h3>
            <label>
              Delivery Date:
              <input type="text" value={confirmationSurvey.deliveryDate} onChange={(e) => setConfirmationSurvey({ ...confirmationSurvey, deliveryDate: e.target.value })} />
            </label>
            <label>
              Time:
              <input type="text" value={confirmationSurvey.time} onChange={(e) => setConfirmationSurvey({ ...confirmationSurvey, time: e.target.value })} />
            </label>
            <label>
              Food Requirements & Limitations:
              <input type="text" value={confirmationSurvey.foodRequirements} onChange={(e) => setConfirmationSurvey({ ...confirmationSurvey, foodRequirements: e.target.value })} />
            </label>
            <label>
              Transportation Notes:
              <input type="text" value={confirmationSurvey.transportationNotes} onChange={(e) => setConfirmationSurvey({ ...confirmationSurvey, transportationNotes: e.target.value })} />
            </label>
            <label>
              Food Storage Notes:
              <input type="text" value={confirmationSurvey.foodStorageNotes} onChange={(e) => setConfirmationSurvey({ ...confirmationSurvey, foodStorageNotes: e.target.value })} />
            </label>
            <div className="surveybutton">
              <button type="button" onClick={handleSaveConfirmation}>Save Confirmation</button>
            </div>
          </div>
        </div>
      </section>
      <section className="tracker-section">
        <div className="heading">
          <h1 style={{ fontSize: "5em" }}>03 & 04</h1>
          <h1 style={{ fontSize: "2em" }}>Tracking Progress & Feedback</h1>
        </div>
        <form className="formcheck" onSubmit={handleSubmitFeedback}>
          <div className="progress-line" />
          <div className="progress-checklist">
            <label>
              <input type="checkbox" checked={confirmation} onChange={() => setConfirmation(!confirmation)} />
              <p>Final Logistics Confirmation</p>
            </label>
            <label>
              <input type="checkbox" checked={pickup} onChange={() => setPickup(!pickup)} />
              <p>Donation Pickup/Delivery</p>
            </label>
            <label>
              <input type="checkbox" checked={received} onChange={() => setReceived(!received)} />
              <p>Donation Received</p>
            </label>
          </div>
          <div className="feedback-form">
            <label>Name</label>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <label>ID</label>
            <input type="text" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
            <label>Comments</label>
            <textarea placeholder="Comments" value={comments} onChange={(e) => setComments(e.target.value)} />
            <label>Rating</label>
            <div className="rating">
              {[...Array(5)].map((star, index) => {
                const currentRating = index + 1;
                return (
                  <span key={index} className={currentRating <= rating ? "filled-star" : "empty-star"} onClick={() => setRating(currentRating)}>
                    ★
                  </span>
                );
              })}
            </div>
            <button type="submit">SUBMIT</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Tracker;
