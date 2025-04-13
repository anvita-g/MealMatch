import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <img src="/logo.png" alt="Meal Match Logo" className="login-logo" />
      <h1 className="login-title">LOG IN</h1>
      <input className="login-input" type="text" placeholder="username" onChange={(e) => setEmail(e.target.value)} />
      <input className="login-input" type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
      <button className="login-button" onClick={handleLogin}>SIGN IN</button>
      <h2 className="account-heading">CREATE AN ACCOUNT</h2>
      <button className="restaurant-button" onClick={() => navigate("/restaurant-login")}>RESTAURANT ACCOUNT</button>
      <button className="shelter-button" onClick={() => navigate("/shelter-login")}>SHELTER ACCOUNT</button>
    </div>
  );
}

export default Login;
