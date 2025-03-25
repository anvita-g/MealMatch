import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import "./Tracking.css";

function Tracking() {
    const [matches, setMatches] = useState([]);
    const [confirmation, setConfirmation] = useState({
        deliveryDate: "",
        time: "",
        foodRequirements: "",
        transportationNotes: "",
        foodStorageNotes: "",
    });

    useEffect(() => {
        const fetchMatches = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) return;

            try {
                const userQuery = query(collection(db, "users"), where("email", "==", currentUser.email));
                const userSnapshot = await getDocs(userQuery);
                if (userSnapshot.empty) return;

                const userData = userSnapshot.docs[0].data();
                const userRole = userData.role;
                const oppositeRole = userRole === "restaurant" ? "shelter" : "restaurant";

                const matchQuery = query(
                    collection(db, "matches"),
                    where(`${userRole}Email`, "==", currentUser.email),
                    where("restaurantRequest", "==", true),
                    where("shelterRequest", "==", true)
                );

                const matchSnapshot = await getDocs(matchQuery);
                const matchedUsers = [];

                for (const matchDoc of matchSnapshot.docs) {
                    const matchData = matchDoc.data();
                    const oppositeUserQuery = query(
                        collection(db, `${oppositeRole}s`),
                        where("email", "==", matchData[`${oppositeRole}Email`])
                    );
                    const oppositeUserSnapshot = await getDocs(oppositeUserQuery);
                    if (!oppositeUserSnapshot.empty) {
                        const oppositeUserData = oppositeUserSnapshot.docs[0].data();
                        matchedUsers.push({ ...oppositeUserData, matchId: matchDoc.id });
                    }

                    const confirmationDoc = await getDocs(query(collection(db, "confirmation"), where("matchId", "==", matchDoc.id)));
                    if (!confirmationDoc.empty) {
                        setConfirmation(confirmationDoc.docs[0].data());
                    }
                }

                setMatches(matchedUsers);
            } catch (error) {
                console.error("Error fetching matches:", error);
            }
        };

        fetchMatches();
    }, []);

    const handleUnmatch = async (matchId) => {
        try {
            const matchRef = doc(db, "matches", matchId);
            await updateDoc(matchRef, { restaurantRequest: false, shelterRequest: false });
            setMatches(matches.filter((match) => match.matchId !== matchId));
        } catch (error) {
            console.error("Error unmatching:", error);
        }
    };

    const handleConfirmationChange = (e) => {
        setConfirmation({ ...confirmation, [e.target.name]: e.target.value });
    };

    const saveConfirmation = async (matchId) => {
        try {
            await setDoc(doc(db, "confirmation", matchId), { matchId, ...confirmation });
        } catch (error) {
            console.error("Error saving confirmation:", error);
        }
    };

    return (
        <div className="match-request-page">
            <h1>Tracking</h1>
            {matches.length === 0 ? (
                <p>No matches found.</p>
            ) : (
                <div className="match-cards">
                    {matches.map((match) => (
                        <div key={match.matchId} className="match-card">
                            <h2>{match.name || "No Name"}</h2>
                            <p><strong>Email:</strong> {match.email || "No Email"}</p>
                            <p><strong>Phone:</strong> {match.phoneNumber || "No Phone"}</p>
                            <p><strong>Address:</strong> {match.address || "No Address"}</p>
                            <p><strong>Website:</strong> {match.website || "No Website"}</p>
                            <p><strong>Description:</strong> {match.description || "No Description"}</p>
                            <p><strong>Arrangement:</strong> {match.arrangement || "Not specified"}</p>
                            <p>
                                <strong>Tags:</strong>{" "}
                                {match.tags && Array.isArray(match.tags) ? match.tags.join(", ") : "No Tags"}
                            </p>

                            <button className="unmatch-button" onClick={() => handleUnmatch(match.matchId)}>
                                Cancel Match
                            </button>

                            <h3>Confirmation Survey</h3>
                            <label>
                                Delivery Date:
                                <input type="text" name="deliveryDate" value={confirmation.deliveryDate} onChange={handleConfirmationChange} />
                            </label>
                            <label>
                                Time:
                                <input type="text" name="time" value={confirmation.time} onChange={handleConfirmationChange} />
                            </label>
                            <label>
                                Food Requirements:
                                <input type="text" name="foodRequirements" value={confirmation.foodRequirements} onChange={handleConfirmationChange} />
                            </label>
                            <label>
                                Transportation Notes:
                                <input type="text" name="transportationNotes" value={confirmation.transportationNotes} onChange={handleConfirmationChange} />
                            </label>
                            <label>
                                Food Storage Notes:
                                <input type="text" name="foodStorageNotes" value={confirmation.foodStorageNotes} onChange={handleConfirmationChange} />
                            </label>

                            <button className="save-button" onClick={() => saveConfirmation(match.matchId)}>
                                Save Confirmation
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Tracking;
