import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./MatchRequest.css";

function MatchRequest() {
  const [role, setRole] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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
          console.error("User not found in users collection");
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
        setMatches(matchesData);
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
      <h1>Match Requests</h1>
      {matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <div className="match-cards">
          {matches.map((match, index) => (
            <div key={index} className="match-card">
              <h2>{match.name || "No Name"}</h2>
              <p><strong>Email:</strong> {match.email || "No Email"}</p>
              <p><strong>Phone:</strong> {match.phoneNumber || "No Phone"}</p>
              <p><strong>Address:</strong> {match.address || "No Address"}</p>
              <p><strong>Website:</strong> {match.website || "No Website"}</p>
              <p><strong>Description:</strong> {match.description || "No Description"}</p>
              <p><strong>Arrangement:</strong> {match.arrangement || "Not specified"}</p>
              <p>
                <strong>Tags:</strong>{" "}
                {match.tags && Array.isArray(match.tags)
                  ? match.tags.join(", ")
                  : "No Tags"}
              </p>
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
