import React, { useState, useRef, useEffect } from "react";
import "./Search.css";

const Search = ({
  selectedDays, setSelectedDays,
  selectedTimes, setSelectedTimes,
  selectedTags, setSelectedTags,
  radius, setRadius,
  selectedDelivery, setSelectedDelivery
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const days = ["M", "T", "W", "Th", "F", "SA", "SN"];
  const times = ["Morning", "Afternoon", "Evening"];
  const delivery = ["pickup", "delivery"];
  const tagOptions = [
    "Buddhist", "Dairy-Free", "Gluten-Free", "Halal", "Hindu",
    "Keto", "Kosher", "Low FODMAP", "Low Sodium", "Low Sugar",
    "Nut-Free", "Paleo", "Pescatarian", "Soy-Free", "Vegan", "Vegetarian"
  ];
  //const tagOptions = ["Vegan", "Halal", "Gluten-Free", "Kosher", "Nut-Free"];
  const radiusOptions = [5, 10, 25, 50, 100];

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSelection = (item, list, setList) => {
    setList(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleRadiusChange = e => {
    const index = parseInt(e.target.value);
    const snapped = radiusOptions[index];
    setRadius(snapped);
  };

  const handleTagSelect = tag => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setShowDropdown(false);
  };

  const toggleTag = tagToRemove => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const getRadiusIndex = () => {
    const idx = radiusOptions.findIndex(r => r === radius);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div>
      <div style={{ paddingLeft: "5%", paddingRight: "5%" }}>
        <h3>Days of the week</h3>
        <div className="tags" style={{ justifyContent: "start" }}>
          {days.map(d => (
            <span
              key={d}
              style={{ borderRadius: "0px", padding: "3% 3%" }}
              className={`tag ${selectedDays.includes(d) ? "" : "inactive"}`}
              onClick={() => toggleSelection(d, selectedDays, setSelectedDays)}
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      <div style={{ paddingLeft: "5%", paddingRight: "5%" }}>
        <h3>Time of Day</h3>
        <div className="tags" style={{ justifyContent: "left" }}>
          {times.map(t => (
            <span
              key={t}
              style={{ borderRadius: "0px", padding: "3% 7%" }}
              className={`tag ${selectedTimes.includes(t) ? "" : "inactive"}`}
              onClick={() => toggleSelection(t, selectedTimes, setSelectedTimes)}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div style={{ paddingLeft: "5%", paddingRight: "5%" }}>
        <h4>RADIUS</h4>
        <input
          type="range"
          min="0"
          max="4"
          step="1"
          value={getRadiusIndex()}
          onChange={handleRadiusChange}
          className="radius-slider"
        />
        <div className="radius-labels">
          <span>5 Miles</span>
          <span>10 Miles</span>
          <span>25 Miles</span>
          <span>50 Miles</span>
          <span>&gt; 50 Miles</span>
        </div>
      </div>

      <div style={{ paddingLeft: "5%", paddingRight: "5%" }}>
        <h4>ARRANGEMENT</h4>
        <div className="tags" style={{ justifyContent: "left" }}>
          {delivery.map(o => (
            <span
              key={o}
              style={{ borderRadius: "0px", padding: "3% 7%" }}
              className={`tag ${selectedDelivery.includes(o) ? "" : "inactive"}`}
              onClick={() => toggleSelection(o, selectedDelivery, setSelectedDelivery)}
            >
              {o.charAt(0).toUpperCase() + o.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div style={{ paddingLeft: "5%", paddingRight: "5%" }}>
        <h4>TAGS</h4>
        <div className="custom-dropdown" ref={dropdownRef}>
          <div
            className="dropdown-trigger"
            onClick={() => setShowDropdown(prev => !prev)}
          >
            Select a tag
          </div>
          {showDropdown && (
            <div className="dropdown-menu">
              {tagOptions
                .filter(option => !selectedTags.includes(option))
                .map(option => (
                  <div
                    key={option}
                    className="dropdown-option"
                    onClick={() => handleTagSelect(option)}
                  >
                    {option}
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="tags" style={{ justifyContent: "left" }}>
          {selectedTags.map(tag => (
            <span key={tag} className="tag">
              {tag} <span className="remove-x" onClick={() => toggleTag(tag)}>✕</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
