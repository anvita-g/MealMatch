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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
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
            } else {
              setUser({ name: currentUser.displayName || "User" });
            }
            await fetchNotifications(currentUser.email, userRole);
          } else {
            setUser({ name: currentUser.displayName || "User" });
          }
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

  const fetchNotifications = async (email, userRole) => {
    try {
      const matchesQuery = query(
        collection(db, "matches"),
        where(
          userRole === "restaurant" ? "restaurantEmail" : "shelterEmail",
          "==",
          email
        )
      );
      const matchesSnapshot = await getDocs(matchesQuery);
      const notifs = [];
      const oppositeCollection = userRole === "restaurant" ? "shelters" : "restaurants";

      for (const matchDoc of matchesSnapshot.docs) {
        const data = matchDoc.data();
        let matchedEmail = "";
        let matchedName = "";
        if (userRole === "restaurant") {
          matchedEmail = data.shelterEmail;
        } else {
          matchedEmail = data.restaurantEmail;
        }
        const q = query(
          collection(db, oppositeCollection),
          where("email", "==", matchedEmail)
        );
        const oppSnapshot = await getDocs(q);
        if (!oppSnapshot.empty) {
          matchedName = oppSnapshot.docs[0].data().name;
        } else {
          matchedName = matchedEmail;
        }
        if (userRole === "restaurant") {
          if (data.shelterRequest && !data.restaurantRequest) {
            notifs.push(`${matchedName} sent you a request`);
          } else if (data.shelterRequest && data.restaurantRequest) {
            notifs.push(`You have matched with ${matchedName}`);
          }
        } else {
          if (data.restaurantRequest && !data.shelterRequest) {
            notifs.push(`${matchedName} sent you a request`);
          } else if (data.restaurantRequest && data.shelterRequest) {
            notifs.push(`You have matched with ${matchedName}`);
          }
        }
      }
      setNotifications(notifs);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setDropdownOpen(false);
      setNotificationsOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNavClick = () => {
    setDropdownOpen(false);
    setNotificationsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/logo.png" alt="MealMatch Logo" className="navbar-logo" />
        <Link to="/" className="navbar-title" onClick={handleNavClick}>
          MealMatch
        </Link>
      </div>

      {!user ? (
        <div className="navbar-auth">
          <Link to="/login" onClick={handleNavClick}>Log in / Create Account</Link>
        </div>
      ) : (
        <div className="navbar-user">
          <FaBell
            className="navbar-icon"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setDropdownOpen(false);
            }}
          />
          {notificationsOpen && (
            <div className="notifications-dropdown">
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <p key={index} className="notification">{notif}</p>
                ))
              ) : (
                <p className="notification">No notifications</p>
              )}
            </div>
          )}
          <div className="navbar-dropdown">
            <button
              className="navbar-user-btn"
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotificationsOpen(false);
              }}
            >
              Hi, {user.name} <IoMdArrowDropdown />
            </button>
            {dropdownOpen && (
              <ul className="navbar-menu">
                <li><Link to="/" onClick={handleNavClick}>Home</Link></li>
                <li><Link to="/match-request" onClick={handleNavClick}>Request Match</Link></li>
                <li><Link to="/tracking" onClick={handleNavClick}>Tracking</Link></li>
                <li><Link to="/settings/profile" onClick={handleNavClick}>Settings</Link></li>
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
