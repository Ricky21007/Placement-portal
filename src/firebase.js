// src/firebase.js
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Your new Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAff33MBefu5TzBdARUuM4-ytbF7kgy8j4",
  authDomain: "capaciti-placement-portal.firebaseapp.com",
  projectId: "capaciti-placement-portal",
  storageBucket: "capaciti-placement-portal.appspot.com", // ⚠️ FIXED typo from `.firebasestorage.app` to `.appspot.com`
  messagingSenderId: "306181793625",
  appId: "1:306181793625:web:ebeeb205623798dbae4e48",
  measurementId: "G-CC5P2YS5NY",
};

// ✅ Initialize Firebase services
let app;
let analytics;
let auth;
let db;
let storage;

if (typeof window !== "undefined") {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, analytics, auth, db, storage };