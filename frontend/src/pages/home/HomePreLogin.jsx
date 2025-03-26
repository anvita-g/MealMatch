import React from 'react';
import './HomePreLogin.css';
import banner from '/Users/nishita/MealMatch/frontend/src/assets/banner.png';
import shelterIcon from '/Users/nishita/MealMatch/frontend/src/assets/i1.png';
import restaurantIcon from '/Users/nishita/MealMatch/frontend/src/assets/i2.png';
import faqIcon from '/Users/nishita/MealMatch/frontend/src/assets/i4.png';
import fdaIcon from '/Users/nishita/MealMatch/frontend/src/assets/i6.png';

const Resources = () => {
  return (
      <div className="banner">
        <img src={banner} alt="Connecting Plates, Building Community" />
      
      <div className="resources-section">
        <h2>Resources</h2>
        <div className="resource-buttons">
          <div className="resource-card">
            <img src={shelterIcon} alt="Shelter Icon" />
            <a
              className="orange-button"
              href="https://www.example.com/shelter-how-to"
              target="_blank"
              rel="noopener noreferrer"
            >
              SHELTER HOW-TO
            </a>
          </div>
          <div className="resource-card">
            <img src={restaurantIcon} alt="Restaurant Icon" />
            <a
              className="orange-button"
              href="https://www.example.com/restaurant-how-to"
              target="_blank"
              rel="noopener noreferrer"
            >
              RESTAURANT HOW-TO
            </a>
          </div>
          <div className="resource-card">
            <img src={faqIcon} alt="FAQ Icon" />
            <a
              className="orange-button"
              href="https://www.example.com/donation-faq"
              target="_blank"
              rel="noopener noreferrer"
            >
              DONATION FAQ
              
            </a>
          </div>
          <div className="resource-card">
            <img src={fdaIcon} alt="FDA Icon" />
            <a
              className="orange-button"
              href="https://www.fda.gov/food/food-donation"
              target="https://www.fda.gov/"
              rel="https://www.fda.gov/"
            >
              FDA REGULATIONS
            </a>

            <h2> </h2>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Resources;
