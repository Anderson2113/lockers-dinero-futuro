import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCkLR1NU10EsWWiMJ_m4hHAO5NBr0X6mJg",
  authDomain: "gma-lockers.firebaseapp.com",
  projectId: "gma-lockers",
  storageBucket: "gma-lockers.firebasestorage.app",
  messagingSenderId: "643395239011",
  appId: "1:643395239011:web:a2b35dd3820e39edea4c56"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
const db = getFirestore(app);
const firebaseAuth = getAuth(app);

export { db, firebaseAuth };
