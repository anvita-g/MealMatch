import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";
import "./Tracking.css";
import Tracker from './Tracker';

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
        <div className="tracking-page" style={{backgroundColor: "white"}}>
            {/* <h1 className="tracking-heading">Tracking</h1> */}
            <div className="tracking-hero">
            <h1 className="tracking-title">Your Match</h1>
            <p className="tracking-subtitle">
                Follow four simple steps to connect, coordinate, track, and complete your food donation effortlessly.
            </p>

            <div className="tracking-steps">
                {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="tracking-step">
                        <div className={`step-circle step-${step}`}>
                            <div className="step-number">0{step}</div>
                            <div className="step-label">STEP</div>
                        </div>
                        <div className="step-text">
                            {step === 1 && (
                                <>
                                    <h3>Review Your Match</h3>
                                    <p>Check the details of your match! Ensure the partnership aligns with your needs before moving forward.</p>
                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <h3>Discuss the Details</h3>
                                    <p>Communicate with your match to finalize the logistics for a smooth donation process.</p>
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <h3>Track Progress</h3>
                                    <p>Monitor the status of your donation as it moves through each stage until completion!</p>
                                </>
                            )}
                            {step === 4 && (
                                <>
                                    <h3>Feedback</h3>
                                    <p>Once the donation is complete, share your experience to help improve future matches!</p>
                                </>
                            )}
                        </div>
                    </div>

                    
                ))}
            </div>
        </div>
            {matches.length === 0 ? (
                <div className="no-match-message">
                    {/* No match currently.<br />
                    We'll notify you when we find a suitable partner! */}
                    <div>
                        <div><Tracker/></div>
                    </div>
                </div>
                
            ) : (
                <div className="match-cards-container">
        {matches.map((match) => (
            <div key={match.id} className="match-card">
                <div className="match-card-header">
                    <h3>{match.partnerName}</h3>
                    <span className={`status-badge status-${match.status.toLowerCase().replace(' ', '-')}`}>
                        {match.status}
                    </span>
                </div>
                <p className="match-description">{match.donationDetails}</p>
                <p className="match-updated">Last updated: {match.lastUpdated}</p>
                <button className="match-button">View Details</button>
            </div>
        ))}
    </div>
            )}
        </div>
    );
}

export default Tracking;