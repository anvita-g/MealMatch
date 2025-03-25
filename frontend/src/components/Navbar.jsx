import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import "./Navbar.css";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

function Navbar() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const usersQuery = query(
            collection(db, "users"),
            where("email", "==", currentUser.email)
          );
          const usersSnapshot = await getDocs(usersQuery);
          if (!usersSnapshot.empty) {
            const userData = usersSnapshot.docs[0].data();
            const userRole = userData.role;
            const profileQuery = query(
              collection(db, userRole + "s"),
              where("email", "==", currentUser.email)
            );
            const profileSnapshot = await getDocs(profileQuery);
            if (!profileSnapshot.empty) {
              const profileData = profileSnapshot.docs[0].data();
              setUser({ name: profileData.name });
              return;
            }
          }
          setUser({ name: currentUser.displayName || "User" });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser({ name: currentUser.displayName || "User" });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/logo.png" alt="MealMatch Logo" className="navbar-logo" />
        <Link to="/" className="navbar-title">MealMatch</Link>
      </div>

      {!user ? (
        <div className="navbar-auth">
          <Link to="/login">Log in / Create Account</Link>
        </div>
      ) : (
        <div className="navbar-user">
          <FaBell className="navbar-icon" />
          <div className="navbar-dropdown">
            <button
              className="navbar-user-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Hi, {user.name} <IoMdArrowDropdown />
            </button>
            {dropdownOpen && (
              <ul className="navbar-menu">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/match-request">Request Match</Link></li>
                <li><Link to="/tracking">Tracking</Link></li>
                <li><Link to="/settings/profile">Settings</Link></li>
                <li>
                  <button className="logout-btn" onClick={handleLogout}>
                    Log Out
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
