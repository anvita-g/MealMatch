import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

function RestaurantSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      await addDoc(collection(db, "restaurants"), {
        name: restaurantName,
        email: user.email,
        createdAt: Timestamp.fromDate(new Date()),
      });

      await addDoc(collection(db, "users"), {
        email: user.email,
        role: "restaurant",
        createdAt: Timestamp.fromDate(new Date()),
      });

      alert("Restaurant account created successfully!");
      navigate("/confirmation");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Restaurant Sign Up</h1>
      <input
        type="text"
        placeholder="Restaurant Name"
        onChange={(e) => setRestaurantName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignup}>Sign Up as Restaurant</button>
      <button onClick={() => navigate("/login")}>Back to Login</button>
    </div>
  );
}

export default RestaurantSignup;
