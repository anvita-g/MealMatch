import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./MatchRequest.css";
import Search from "./Search";

function MatchRequest() {
  const [role, setRole] = useState(null);
  const [topMatch, setTopMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [radius, setRadius] = useState(25);

  const [allMatches, setAllMatches] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const [sentMatches, setSentMatches] = useState(new Set());

  const computeMatchScore = (currentUserData, match) => {
    let score = 0;
    if (
      currentUserData.arrangement &&
      match.arrangement &&
      typeof match.arrangement === "string" &&
      currentUserData.arrangement.toLowerCase() === match.arrangement.toLowerCase()
    ) {
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
    setLoading(true);
    const fetchMatches = async () => {
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
        setRole(userData.role);
        setUserLocation(userData.location || null);

        const oppositeCollection = userData.role === "restaurant" ? "shelters" : "restaurants";
        const matchesQuery = query(collection(db, oppositeCollection));
        const matchesSnapshot = await getDocs(matchesQuery);
        const fetchedMatches = matchesSnapshot.docs.map(doc => doc.data());
        const scoredMatches = fetchedMatches.map(match => ({
          ...match,
          score: computeMatchScore(userData, match)
        }));
        scoredMatches.sort((a, b) => (b.score || 0) - (a.score || 0));
        setAllMatches(scoredMatches);
        setTopMatch(scoredMatches[0] || null);
        setMatches(scoredMatches.slice(1));
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        fetchMatches();
      } else {
        setMatches([]);
        setTopMatch(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchSentRequests() {
      const currentUser = auth.currentUser;
      if (!currentUser || !role) return;
      let q;
      if (role === "restaurant") {
        q = query(collection(db, "matches"), where("restaurantEmail", "==", currentUser.email));
      } else {
        q = query(collection(db, "matches"), where("shelterEmail", "==", currentUser.email));
      }
      try {
        const snapshot = await getDocs(q);
        const emailSet = new Set();
        snapshot.forEach(doc => {
          const data = doc.data();
          if (role === "restaurant") {
            if (data.shelterEmail) emailSet.add(data.shelterEmail);
          } else {
            if (data.restaurantEmail) emailSet.add(data.restaurantEmail);
          }
        });
        setSentMatches(emailSet);
      } catch (error) {
        console.error("Error fetching sent match requests:", error);
      }
    }
    fetchSentRequests();
  }, [role]);

  const filterMatchesByDBFields = match => {
    if (selectedTags.length > 0) {
      if (!match.tags || !Array.isArray(match.tags)) return false;
      const matchTagsLower = match.tags.map(t => t.toLowerCase());
      if (!selectedTags.every(tag => matchTagsLower.includes(tag.toLowerCase()))) {
        return false;
      }
    }
    if (selectedDays.length > 0) {
      if (!match.days || !Array.isArray(match.days)) return false;
      const matchDaysUpper = match.days.map(d => d.toUpperCase());
      if (!selectedDays.every(day => matchDaysUpper.includes(day.toUpperCase()))) {
        return false;
      }
    }
    if (selectedTimes.length > 0) {
      if (!match.times || !Array.isArray(match.times)) return false;
      const matchTimesUpper = match.times.map(t => t.toUpperCase());
      if (!selectedTimes.every(time => matchTimesUpper.includes(time.toUpperCase()))) {
        return false;
      }
    }
    if (selectedDelivery.length > 0) {
      if (!match.arrangement || typeof match.arrangement !== "string") return false;
      const arrangementStr = String(match.arrangement).toLowerCase();
      if (!selectedDelivery.some(sel => arrangementStr === sel.toLowerCase())) {
        return false;
      }
    }
    return true;
  };

  const handleApplyFilter = () => {
    let filtered = allMatches;
    if (selectedDays.length || selectedTimes.length || selectedDelivery.length || selectedTags.length) {
      filtered = allMatches.filter(filterMatchesByDBFields);
    }
    if (searchQuery) {
      filtered = filtered.filter(match =>
        (match.name && match.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (match.description && match.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    filtered.sort((a, b) => (b.score || 0) - (a.score || 0));
    setTopMatch(filtered[0] || null);
    setMatches(filtered.slice(1));
  };

  const handleRequest = async match => {
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
          createdAt: new Date()
        };
        await setDoc(matchDocRef, newMatch);
        alert("Match request sent!");
        setSentMatches(prev => new Set(prev).add(matchedEmail));
      }
    } catch (error) {
      console.error("Error processing match request:", error);
      alert("Error processing match request");
    }
  };

  if (loading) return <p>Loading matches...</p>;

  const alreadySent = candidateEmail => sentMatches.has(candidateEmail);

  return (
    <div className="match-request-page">
      {/* <div className="search-bar">
        <input
          type="text"
          placeholder="Search for matches..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div> */}

      {topMatch && (
        <div className="outside" style={{ display: "grid", justifyContent: "center", justifyItems: "center" }}>
          <h1 style={{ paddingBottom: "10%" }}>Top Match</h1>
          <div className="match-card">
            <h2>{topMatch.name || "No Name"}</h2>
            <span className="tag2">Active</span>
            <div className="box1">
              <p style={{ textAlign: "center" }}>{topMatch.description || "No Description"}</p>
              <p><strong>Email:</strong> {topMatch.email || "No Email"}</p>
              <p><strong>Phone:</strong> {topMatch.phoneNumber || "No Phone"}</p>
              <p><strong>Address:</strong> {topMatch.address || "No Address"}</p>
              <p><strong>Website:</strong> {topMatch.website || "No Website"}</p>
              <p><strong>Arrangement:</strong> {topMatch.arrangement || "Not specified"}</p>
              <div className="availability">
                <h3>AVAILABILITY</h3>
                <div className="availability-days">
                  {Array.isArray(topMatch.days) && topMatch.days.map((day, i) => (
                    <span key={i}>{day}</span>
                  ))}
                </div>
                <div className="availability-times">
                  {Array.isArray(topMatch.times) && topMatch.times.map((time, i) => (
                    <span key={i}><i className="fa fa-sun"></i> {time}</span>
                  ))}
                </div>
              </div>
              <div className="delivery">
                <i className="fa fa-truck"></i> Delivery
                <i className="fa fa-location-arrow"></i> Pickup
              </div>
              <h3>TAGS</h3>
              <div className="tags">
                {Array.isArray(topMatch.tags) && topMatch.tags.length > 0 ? (
                  topMatch.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))
                ) : (
                  <span className="tag">No Tags</span>
                )}
              </div>
            </div>
            <button
              className={`request-button ${alreadySent(topMatch.email) ? "sent" : ""}`}
              onClick={() => !alreadySent(topMatch.email) && handleRequest(topMatch)}
            >
              {alreadySent(topMatch.email) ? "Sent" : "Request"}
            </button>
          </div>
        </div>
      )}

      <div className="search-results-grid">
        <div className="searchBox">
          <Search
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            selectedTimes={selectedTimes}
            setSelectedTimes={setSelectedTimes}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            radius={radius}
            setRadius={setRadius}
            selectedDelivery={selectedDelivery}
            setSelectedDelivery={setSelectedDelivery}
          />
          <button onClick={handleApplyFilter} className="request-button" style={{ marginTop: "20px" }}>
            Apply Filters
          </button>
        </div>

        <div className="match-cards">
          {matches.length === 0 ? (
            <p>No matches found.</p>
          ) : (
            matches.map((match, index) => (
              <div key={index} className="match-card">
                <h2>{match.name || "No Name"}</h2>
                <span className="tag2">Active</span>
                <div className="box1">
                  <p style={{ textAlign: "center" }}>{match.description || "No Description"}</p>
                  <p><strong>Email:</strong> {match.email || "No Email"}</p>
                  <p><strong>Phone:</strong> {match.phoneNumber || "No Phone"}</p>
                  <p><strong>Address:</strong> {match.address || "No Address"}</p>
                  <p><strong>Website:</strong> {match.website || "No Website"}</p>
                  <p><strong>Arrangement:</strong> {match.arrangement || "Not specified"}</p>
                  <div className="availability">
                    <h3>AVAILABILITY</h3>
                    <div className="availability-days">
                      {Array.isArray(match.days) && match.days.map((day, i) => (
                        <span key={i}>{day}</span>
                      ))}
                    </div>
                    <div className="availability-times">
                      {Array.isArray(match.times) && match.times.map((time, i) => (
                        <span key={i}><i className="fa fa-sun"></i> {time}</span>
                      ))}
                    </div>
                  </div>
                  <div className="delivery">
                    <i className="fa fa-truck"></i> Delivery
                    <i className="fa fa-location-arrow"></i> Pickup
                  </div>
                  <h3>TAGS</h3>
                  <div className="tags">
                    {Array.isArray(match.tags) && match.tags.length > 0 ? (
                      match.tags.map((tag, i) => (
                        <span key={i} className="tag">{tag}</span>
                      ))
                    ) : (
                      <span className="tag">No Tags</span>
                    )}
                  </div>
                </div>
                <button
                  className={`request-button ${alreadySent(match.email) ? "sent" : ""}`}
                  onClick={() => !alreadySent(match.email) && handleRequest(match)}
                >
                  {alreadySent(match.email) ? "Sent" : "Request"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchRequest;
