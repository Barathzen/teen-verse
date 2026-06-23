import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBEQ-lWvAl8-oaKYaUlVkEIuI3YOti1eEA",
  authDomain: "teen-verse.firebaseapp.com",
  projectId: "teen-verse",
  storageBucket: "teen-verse.firebasestorage.app",
  messagingSenderId: "735112440111",
  appId: "1:735112440111:web:ccc4aad42186ceef05d9da"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
