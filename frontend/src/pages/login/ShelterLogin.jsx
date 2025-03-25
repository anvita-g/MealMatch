import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import "./ShelterLogin.css";

function ShelterSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shelterName, setShelterName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return; // Stop the function if the passwords do not match
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await addDoc(collection(db, "shelters"), {
        name: shelterName,
        email: user.email,
        createdAt: Timestamp.fromDate(new Date()),
        phoneNumber: null,
        address: null,
        website: null,
        availability: {},
        times: {},
        radius: null,
        arrangement: null,
        tags: {},
        description: null,
      });

      await addDoc(collection(db, "users"), {
        email: user.email,
        role: "shelter",
        createdAt: Timestamp.fromDate(new Date()),
      });

      alert("Shelter account created successfully!");
      navigate("/confirmation");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="background">

    <div className="title">
      <button className = "back-button"> BACK </button>
      <h1 className="login-title">CREATE A SHELTER ACCOUNT</h1>
    </div>
    <div className="signup-container">
      <h4>SHELTER NAME *</h4>
      <input
        type="text"
        placeholder="shelter name"
        value={shelterName}
        onChange={(e) => setShelterName(e.target.value)}
      />
      <h4>PASSWORD *</h4>
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <h4>CONFIRM PASSWORD *</h4>
      <input
        type="password"
        placeholder="reenter password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <h4>CONTACT: EMAIL</h4>
      <input
        type="email"
        placeholder="Email@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <h4 className="tc">Terms and Conditions</h4>
      <p>
        1. By using Meal Match, you agree to these Terms and Conditions. If you do not agree, you may not use the Platform. We will run a background check to confirm this is a real business to allow your account to be accepted.
        2. MealMatch facilitates business connections by revealing contact email information once a match between businesses is confirmed. All further communication between parties occurs off-platform. To proceed with connections, users must interact with designated stages on the Platform.
        3. Users must provide accurate information when signing up. Users are responsible for their communications after a match is made. The Platform is not liable for any interactions, agreements, or disputes that arise between matched parties.
        4. Contact email information is only revealed upon mutual confirmation of a match.The Platform does not facilitate or monitor further communications between users.
        5. MealMatch is not responsible for any damages, losses, or disputes resulting from user interactions after contact information has been shared.
        6. We reserve the right to modify these Terms and Conditions at any time. Continued use of the Platform constitutes acceptance of any changes.
      </p>
    </div>
    <button className="shelter-button" onClick={handleSignup}>I ACCEPT</button>
    </div>
  );
}

export default ShelterSignup;