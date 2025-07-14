import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ✅ add this

const firebaseConfig = {
  apiKey: "AIzaSyBeUmUesr3cIf1tS0KmDdYedF5selfaBpA",
  authDomain: "savans-pharmacy.firebaseapp.com",
  projectId: "savans-pharmacy",
  storageBucket: "savans-pharmacy.firebasestorage.app",
  messagingSenderId: "291301413874",
  appId: "1:291301413874:web:fe847fbca93c775f22916b",
  measurementId: "G-T3SYCHH988"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // ✅ export Firestore
