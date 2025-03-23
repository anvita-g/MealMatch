// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNB6bOvj1-1cBtvTv6BmvUGzMx3luqGv8",
  authDomain: "meal-match-e7ac9.firebaseapp.com",
  projectId: "meal-match-e7ac9",
  storageBucket: "meal-match-e7ac9.firebasestorage.app",
  messagingSenderId: "104797539225",
  appId: "1:104797539225:web:7dea3cf78c63d33a07e108"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
