import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null); // nyers Firebase Auth user
  const [profile, setProfile] = useState(null);           // Firestore profil
  const [loading, setLoading] = useState(true);

  // Figyeljük az Auth állapotot
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  // Ha van bejelentkezett user, figyeljük a Firestore profilját
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    setLoading(true);
    const userRef = doc(db, "users", firebaseUser.uid);
    const unsub = onSnapshot(
      userRef,
      (snap) => {
        setProfile(
          snap.exists()
            ? { uid: firebaseUser.uid, ...snap.data() }
            : { uid: firebaseUser.uid }
        );
        setLoading(false);
      },
      (err) => {
        console.error("❌ Firestore user snapshot hiba:", err);
        setProfile({ uid: firebaseUser.uid });
        setLoading(false);
      }
    );
    return unsub;
  }, [firebaseUser]);

  return (
    <AuthContext.Provider
      value={{
        user: profile,       // 🔧 már tartalmazza az uid-et
        firebaseUser,        // nyers Firebase user (email, providerData)
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);