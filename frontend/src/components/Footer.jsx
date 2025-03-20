import React from "react";
import "./Footer.css";
import { FaEnvelope, FaInstagram, FaFacebook, FaTwitter } from "react-icons/fa";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-section brand">
                <h2>MealMatch</h2>
                <p>Connecting Plates, Creating Community</p>
                <img src="/logo.png" alt="MealMatch Logo" className="footer-logo" />
            </div>
            <div className="footer-section">
                <h3>Menu</h3>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/match-request">Request Match</a></li>
                    <li><a href="/tracking">Tracking</a></li>
                    <li><a href="/settings">Settings</a></li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>Resources</h3>
                <ul>
                    <li><a href="https://www.feedingamerica.org" target="_blank" rel="noopener noreferrer">Feeding America</a></li>
                    <li><a href="https://www.usda.gov/about-food/food-safety/food-loss-and-waste" target="_blank" rel="noopener noreferrer">USDA Food Waste</a></li>
                    <li><a href="https://www.fao.org" target="_blank" rel="noopener noreferrer">FAO (Food and Agriculture Organization)</a></li>
                    <li><a href="https://www.wfp.org" target="_blank" rel="noopener noreferrer">World Food Programme (WFP)</a></li>
                </ul>
            </div>
            <div className="footer-section">
                <h3>Contact Us</h3>
                <ul className="social-links">
                    <li><FaEnvelope /> Email</li>
                    <li><FaInstagram /> Instagram</li>
                    <li><FaFacebook /> Facebook</li>
                    <li><FaTwitter /> Twitter</li>
                </ul>
            </div>
        </footer>
    );
}

export default Footer;