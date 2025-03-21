import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import "./Navbar.css";

function Navbar() {
    const [user, setUser] = useState(null); // Default: logged out
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedUser) {
            setUser(savedUser);
        }
    }, []);

    const handleLogin = () => {
        const newUser = { name: "Condado" }; // Hardcoded
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser)); // Save to localStorage
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("user"); // Remove from localStorage
        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src="/logo.png" alt="MealMatch Logo" className="navbar-logo" />
                <Link to="/" className="navbar-title">MealMatch</Link>
            </div>

            {/* If logged out: Show "Log in / Sign Up" */}
            {!user ? (
                <div className="navbar-auth">
                    <Link to="/login" onClick={handleLogin}>Log in / Sign Up</Link>
                </div>
            ) : (
                /* If logged in: Show Notification Bell & User Dropdown */
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
                                <li><button className="logout-btn" onClick={handleLogout}>Log Out</button></li>
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
