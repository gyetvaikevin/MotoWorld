// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  arrayUnion,
  arrayRemove,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,  
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAFMNBtiCJn0pNKkNzsiRhC0ObMvJzfhTo",
  authDomain: "motoworld-5ffd0.firebaseapp.com",
  projectId: "motoworld-5ffd0",
  storageBucket: "motoworld-5ffd0.firebasestorage.app",
  messagingSenderId: "776628248032",
  appId: "1:776628248032:web:aa1db51961e18895331f85",
  measurementId: "G-1TSX3Y86QW"
};

// Alkalmazás inicializálása
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Firestore inicializálása új cache API-val (offline támogatás)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Storage
export const storage = getStorage(app);
