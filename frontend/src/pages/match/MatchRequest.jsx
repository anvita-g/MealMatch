import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./MatchRequest.css";
import Search from './Search';

function MatchRequest() {
  const [role, setRole] = useState(null);
  const [topMatch, setTopMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");  // Search query state
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [radius, setRadius] = useState(25);

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
        const userLocation = userData.location;
        const matchesData = matchesSnapshot.docs.map((doc) => doc.data());
        const scoredMatches = matchesData
          .filter(match => filterMatchesBySearch(match, userLocation))
          .map(match => ({ ...match, score: computeMatchScore(userData, match) }));

        scoredMatches.sort((a, b) => b.score - a.score);

        setTopMatch(scoredMatches[0] || null);
        setMatches(scoredMatches.slice(1));
        
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
      setLoading(false);
    };
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const toRad = val => (val * Math.PI) / 180;
      const R = 3958.8; // Radius of Earth in miles
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    const filterMatchesBySearch = (match, userLocation) => {
      // Filter by tags
      const matchTags = match.tags || [];
      if (selectedTags.length && !selectedTags.every(tag => matchTags.includes(tag))) {
        return false;
      }
    
      // Filter by days
      const matchDays = match.availabilityDays || [];
      if (selectedDays.length && !selectedDays.every(day => matchDays.includes(day))) {
        return false;
      }
    
      // Filter by times
      const matchTimes = match.availabilityTimes || [];
      if (selectedTimes.length && !selectedTimes.every(time => matchTimes.includes(time))) {
        return false;
      }

      // Filter by delivery
      const matchDelivery = match.arrangement || [];
      if (selectedDelivery.length && !selectedDelivery.every(delivery => matchDelivery.includes(delivery))) {
        return false;
      }
    
      // Filter by distance
      if (match.location && userLocation) {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, match.location.lat, match.location.lng);
        if (dist > radius) {
          return false;
        }
      }
    
      return true;
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

  
  // Filter matches based on search query
  const filteredMatches = matches.filter(match =>
    match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p>Loading matches...</p>;

  return (
    <div className="match-request-page">
      {/* <h1 className="active-heading">Match Requests</h1> */}
      
      {/* Search Bar
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for matches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div> */}

      {topMatch && (
        <div className="outside" style={{display: "grid", justifyContent: "center", justifyItems: "center"}}>
          <h1 style={{paddingBottom: "10%"}}>Top Match</h1>
          <div className="match-card">
            <h2>{topMatch.name || "No Name"}</h2>
            <span className="tag2">Active</span>
            <div className="box1">
              <p style={{textAlign: "center"}}>{topMatch.description || "No Description"}</p>
              <p><strong>Email:</strong> {topMatch.email || "No Email"}</p>
              <p><strong>Phone:</strong> {topMatch.phoneNumber || "No Phone"}</p>
              <p><strong>Address:</strong> {topMatch.address || "No Address"}</p>
              <p><strong>Website:</strong> {topMatch.website || "No Website"}</p>
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

      {filteredMatches.length > 0 && <h2 style={{marginTop: "10%", fontWeight: "bolder",
        paddingLeft: "5%", paddingRight: "5%"
      }}>Explore more options</h2>}

      {filteredMatches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
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
              setSelectedDelivery={setSelectedDelivery}
            />
          </div>
          <div className="match-cards">
          {filteredMatches.map((match, index) => (
            <div key={index} className="match-card">
              <h2>{match.name || "No Name"}</h2>
              <span className="tag2">Active</span>
              <div className="box1">
                <p style={{textAlign: "center"}}>{match.description || "No Description"}</p>
                <p><strong>Address:</strong> {match.address || "No Address"}</p>
                <p><strong>Website:</strong> {match.website || "No Website"}</p>
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
        </div>

        
      )}
    </div>
  );
}

export default MatchRequest;