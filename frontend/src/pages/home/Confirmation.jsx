import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Confirmation.css';  // Your CSS file

function Confirmation() {
  const navigate = useNavigate();

  // Handlers for the buttons
  const handleBackHome = () => {
    navigate('/');
  };

  const handleSkip = () => {
    navigate('/settings/profile');
  };

  return (
    <div className="confirmation-container">
      <p className="confirmation-text">
        ONCE YOUR BACKGROUND CHECK CLEARS, WE WILL SEND YOU A CONFIRMATION EMAIL THAT YOUR ACCOUNT
        IS APPROVED. ONCE YOU RECEIVE THAT EMAIL, YOU WILL BE ABLE TO SET YOUR PROFILE AND
        PREFERENCES. FINALLY, YOU CAN START LOOKING FOR MATCHES!
      </p>

      <button className="back-home-button" onClick={handleBackHome}>
        BACK TO HOME
      </button>

      <button className="skip-button" onClick={handleSkip}>
        SKIP
      </button>
    </div>
  );
}

export default Confirmation;
