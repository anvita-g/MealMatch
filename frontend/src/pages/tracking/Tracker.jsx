import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import './Tracker.css';
// import MatchingRequest from './match/MatchingRequest';

const Tracker = () => {
    // State hooks for form inputs
    const [confirmation, setConfirmation] = useState(false);
    const [pickup, setPickup] = useState(false);
    const [received, setReceived] = useState(false);
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const [comments, setComments] = useState('');
    const [rating, setRating] = useState(0);
    const [topMatch, setTopMatch] = useState(null);
    const [role, setRole] = useState(null);  
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
            
          } catch (error) {
            console.error("Error fetching matches:", error);
          }
          setLoading(false);
        };
        
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

  if (loading) return <p>Loading matches...</p>;
    // Handlers for form interactions
    const handleCancel = () => {
      // Implement cancellation logic here
    };
  
    const handleSubmitDetails = () => {
      // Implement submission logic for details
    };
  
    const handleSubmitFeedback = () => {
      // Implement submission logic for feedback
    };
    
  
    return (
      <div className="tracker-container">
        {/* Section 01: Review Your Match */}
        <section className="tracker-section">
          <div className="heading">
            <h1 style={{fontSize: "5em"}}>01</h1>
            <h1 style={{fontSize: "2em"}}>Review Your Match</h1>
          </div>
          <div className="match-review">
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
            </div>
            <div className="match-actions">
              <p>Can't proceed with this match?</p>
              <p>Please cancel promptly.</p>
              <button onClick={handleCancel}>CANCEL</button>
            </div>
          </div>
        </section>
  
        {/* Section 02: Discuss the Details */}
        <section className="tracker-section">
          <div className="heading">
            <h1 style={{fontSize: "5em"}}>02</h1>
            <h1 style={{fontSize: "2em"}}>Discuss the Details</h1>
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
                <li>Delivery Date: 03/12/2025</li>
                <li>Time: 5:00 PM EST</li>
                <li>Food Requirements & Limitations: Veg Only</li>
                <li>Transportation Notes: n/a</li>
                <li>Food Storage Notes: n/a</li>
                <div className="surveybutton">
                    <button onClick={handleSubmitDetails}>SUBMIT</button>
                </div>
            </div>
          </div>
        </section>

        <section className="tracker-section">
          <div className="heading">
            <h1 style={{fontSize: "5em"}}>03 & 04</h1>
            <h1 style={{fontSize: "2em"}}>Tracking Progress & Feedback</h1>
          </div>
          <form className="formcheck" onSubmit={handleSubmitFeedback}>
          <div className="progress-line" />
            <div className="progress-checklist">
              <label>
                <input
                  type="checkbox"
                  checked={confirmation}
                  onChange={() => setConfirmation(!confirmation)}
                />
                <p>Final Logistics Confirmation</p>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={pickup}
                  onChange={() => setPickup(!pickup)}
                />
                <p>Donation Pickup/Delivery</p>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={received}
                  onChange={() => setReceived(!received)}
                />
                <p>Donation Received</p>
              </label>
            </div>
            <div className="feedback-form">
              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label>ID</label>
              <input
                type="text"
                placeholder="ID"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
              <label>Comments</label>
              <textarea
                placeholder="Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
              <label>Rating</label>
              <div className="rating">
                {[...Array(5)].map((star, index) => {
                  const currentRating = index + 1;
                  return (
                    <span
                      key={index}
                      className={currentRating <= rating ? 'filled-star' : 'empty-star'}
                      onClick={() => setRating(currentRating)}
                    >
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
