import {
  getApp,
  getApps,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEVgY8naxTZVhPxSHO2T310wLCgott82o",
  authDomain: "oshirisu-2126b.firebaseapp.com",
  projectId: "oshirisu-2126b",
  storageBucket: "oshirisu-2126b.firebasestorage.app",
  messagingSenderId: "696683056347",
  appId: "1:696683056347:web:1dd1cfe524d5b16038d0fe",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
