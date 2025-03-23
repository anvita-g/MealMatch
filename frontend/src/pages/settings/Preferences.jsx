import "./Preferences.css";
import SettingsTabs from "./SettingsTabs";
import { useState } from "react";

function Preferences() {
  const [radius, setRadius] = useState(50);
  const [arrangement, setArrangement] = useState("pickup");
  const [tags, setTags] = useState(["Vegan", "Halal", "Gluten Free"]);
  const [input, setInput] = useState("");
  const [suggestions] = useState([
    "Kosher",
    "Lactose Intolerance",
    "Pescetarian",
  ]);

  const [days, setDays] = useState(["M", "T", "W", "TH"]);
  const [times, setTimes] = useState(["MORNING", "AFTERNOON"]);

  const toggleTag = (tag) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddTag = () => {
    if (input && !tags.includes(input)) {
      setTags([...tags, input]);
    }
    setInput("");
  };

  return (
    <div className="profile-page">
      <div className="profile-sidebar">
        <h2 className="restaurant-name">Condado</h2>
        <p className="restaurant-type">Restaurant</p>
        <p className="restaurant-location">Ann Arbor, MI</p>
        <span className="status-badge">Active</span>

        <div className="section">
          <h4>CONTACT INFORMATION</h4>
          <p>+1 123 456 7890</p>
          <p>condado@gmail.com</p>
        </div>

        <div className="section">
          <h4>AVAILABILITY</h4>
          <p>M, T, W, TH</p>
          <p>Morning, Afternoon</p>
          <p>Pickup Only</p>
        </div>

        <div className="section">
          <h4>TAGS</h4>
          <div className="tags">
            <span className="tag">Vegan</span>
            <span className="tag">Halal</span>
            <span className="tag">Gluten Free</span>
          </div>
        </div>

        <p className="preview-note">Preview: This page is displayed to others</p>
      </div>

      <div className="profile-main">
        <SettingsTabs />

        <div className="profile-section">
          <h4>AVAILABILITY</h4>
          <div className="preference-flex">
            <div>
              <p><strong>Days of the week</strong></p>
              <div className="tags">
                {["M", "T", "W", "TH", "F", "SA", "SN"].map((d) => (
                  <span key={d} className={`tag ${days.includes(d) ? "" : "inactive"}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p><strong>Time of Day</strong></p>
              <div className="tags">
                {["MORNING", "AFTERNOON", "EVENING"].map((t) => (
                  <span key={t} className={`tag ${times.includes(t) ? "" : "inactive"}`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h4>RADIUS</h4>
          <input
            type="range"
            min="5"
            max="60"
            step="5"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
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

        <div className="profile-section">
          <h4>ARRANGEMENT</h4>
          <div className="tags">
            <span
              className={`tag ${arrangement === "delivery" ? "" : "inactive"}`}
              onClick={() => setArrangement("delivery")}
            >
              DELIVERY
            </span>
            <span
              className={`tag ${arrangement === "pickup" ? "" : "inactive"}`}
              onClick={() => setArrangement("pickup")}
            >
              PICKUP
            </span>
          </div>
        </div>

        <div className="profile-section">
          <h4>TAGS</h4>
          <div className="tag-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter tag"
              list="tag-suggestions"
            />
            <button onClick={handleAddTag}>Add</button>
            <datalist id="tag-suggestions">
              {suggestions
                .filter((s) => s.toLowerCase().includes(input.toLowerCase()))
                .map((s) => (
                  <option key={s} value={s} />
                ))}
            </datalist>
          </div>

          <div className="tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}{" "}
                <span
                  className="remove-x"
                  onClick={() => toggleTag(tag)}
                >
                  ✕
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preferences;