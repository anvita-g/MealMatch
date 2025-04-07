import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./MatchRequest.css";

function MatchRequest() {
  const [role, setRole] = useState(null);
  const [topMatch, setTopMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const computeMatchScore = (currentUserData, match) => {
    let score = 0;
    if (currentUserData.arrangement && match.arrangement && currentUserData.arrangement === match.arrangement) {
      score += 10;
    }
    if (currentUserData.description && match.description) {
      const userDescWords = currentUserData.description.toLowerCase().split(/\s+/);
      const matchDescWords = match.description.toLowerCase().split(/\s+/);
      const commonWords = userDescWords.filter(word => matchDescWords.includes(word));
      score += commonWords.length;
    }
    return score;
  };

  useEffect(() => {
    const fetchMatches = async () => {
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
        const currentRole = userData.role;
        setRole(currentRole);
        const oppositeCollection = currentRole === "restaurant" ? "shelters" : "restaurants";
        const matchesQuery = query(collection(db, oppositeCollection));
        const matchesSnapshot = await getDocs(matchesQuery);
        const matchesData = matchesSnapshot.docs.map((doc) => doc.data());
        const scoredMatches = matchesData.map(match => ({ ...match, score: computeMatchScore(userData, match) }));
        scoredMatches.sort((a, b) => b.score - a.score);
        setTopMatch(scoredMatches[0] || null);
        setMatches(scoredMatches.slice(1));
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
      setLoading(false);
    };
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchMatches();
      } else {
        setMatches([]);
        setTopMatch(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleRequest = async (match) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !role) return;
    const matchedEmail = match.email;
    const compositeId =
      role === "restaurant"
        ? `${currentUser.email}_${matchedEmail}`
        : `${matchedEmail}_${currentUser.email}`;
    const matchDocRef = doc(db, "matches", compositeId);
    try {
      const matchDocSnap = await getDoc(matchDocRef);
      if (matchDocSnap.exists()) {
        const updateData = {};
        if (role === "restaurant") {
          updateData.restaurantRequest = true;
        } else {
          updateData.shelterRequest = true;
        }
        await updateDoc(matchDocRef, updateData);
        alert("Match request updated!");
      } else {
        const newMatch = {
          restaurantEmail: role === "restaurant" ? currentUser.email : matchedEmail,
          shelterEmail: role === "shelter" ? currentUser.email : matchedEmail,
          restaurantRequest: role === "restaurant",
          shelterRequest: role === "shelter",
          createdAt: new Date(),
        };
        await setDoc(matchDocRef, newMatch);
        alert("Match request sent!");
      }
    } catch (error) {
      console.error("Error processing match request:", error);
      alert("Error processing match request");
    }
  };

  if (loading) return <p>Loading matches...</p>;

  return (
    <div className="match-request-page">
      <h1 className="active-heading">Match Requests</h1>
      {topMatch && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="match-card">
            <h2>{topMatch.name || "No Name"}</h2>
            <span className="tag2">Top Match</span>
            <div className="box1">
              <p><strong>Email:</strong> {topMatch.email || "No Email"}</p>
              <p><strong>Phone:</strong> {topMatch.phoneNumber || "No Phone"}</p>
              <p><strong>Address:</strong> {topMatch.address || "No Address"}</p>
              <p><strong>Website:</strong> {topMatch.website || "No Website"}</p>
              <p><strong>Description:</strong> {topMatch.description || "No Description"}</p>
              <p><strong>Arrangement:</strong> {topMatch.arrangement || "Not specified"}</p>
              <div className="availability">
                <h3>AVAILABILITY</h3>
                <div className="availability-days">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                </div>
                <div className="availability-times">
                  <span><i className="fa fa-sun"></i> Morning</span>
                  <span><i className="fa fa-sun"></i> Afternoon</span>
                </div>
              </div>
              <div className="delivery">
                <i className="fa fa-truck"></i> Delivery
                <i className="fa fa-location-arrow"></i> Pickup
              </div>
              <h3>TAGS</h3>
              <div className="tags">
                <span className="tag">Vegan</span>
                <span className="tag">Halal</span>
                <span className="tag">Gluten-Free</span>
              </div>
            </div>
            <button className="request-button" onClick={() => handleRequest(topMatch)}>
              Request
            </button>
          </div>
        </div>
      )}
      {matches.length > 0 && <h2 style={{ textAlign: "center", marginTop: "20px" }}>Explore more options</h2>}
      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <div className="match-cards">
          {matches.map((match, index) => (
            <div key={index} className="match-card">
              <h2>{match.name || "No Name"}</h2>
              <span className="tag2">Active</span>
              <div className="box1">
                <p><strong>Email:</strong> {match.email || "No Email"}</p>
                <p><strong>Phone:</strong> {match.phoneNumber || "No Phone"}</p>
                <p><strong>Address:</strong> {match.address || "No Address"}</p>
                <p><strong>Website:</strong> {match.website || "No Website"}</p>
                <p><strong>Description:</strong> {match.description || "No Description"}</p>
                <p><strong>Arrangement:</strong> {match.arrangement || "Not specified"}</p>
                <div className="availability">
                  <h3>AVAILABILITY</h3>
                  <div className="availability-days">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                  </div>
                  <div className="availability-times">
                    <span><i className="fa fa-sun"></i> Morning</span>
                    <span><i className="fa fa-sun"></i> Afternoon</span>
                  </div>
                </div>
                <div className="delivery">
                  <i className="fa fa-truck"></i> Delivery
                  <i className="fa fa-location-arrow"></i> Pickup
                </div>
                <h3>TAGS</h3>
                <div className="tags">
                  <span className="tag">Vegan</span>
                  <span className="tag">Halal</span>
                  <span className="tag">Gluten-Free</span>
                </div>
              </div>
              <button className="request-button" onClick={() => handleRequest(match)}>
                Request
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MatchRequest;
