import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const DEFAULT_AVATAR = "/default-avatar.png";

// Biztosító rutin: user doc létrehozása/frissítése és photoURL normalizálása
async function ensureUserDocWithDefaults(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const existing = snap.exists() ? snap.data() : {};

  const photoURL =
    (existing.photoURL && existing.photoURL.trim()) ||
    (user.photoURL && user.photoURL.trim()) ||
    DEFAULT_AVATAR;

  const payload = {
    email: user.email || existing.email || "",
    displayName: user.displayName || existing.displayName || "",
    photoURL,
    // ne írjunk felül más mezőket; csak ami kell
  };

  await setDoc(userRef, payload, { merge: true });
  return (await getDoc(userRef)).data();
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Email login esetén is normalizáljuk a user docot (lehet, hogy korábban rossz állapotba került)
      await ensureUserDocWithDefaults(cred.user);

      setSuccess("Sikeres bejelentkezés!");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore doc normalizálás és azonnali visszaolvasás
      const userData = await ensureUserDocWithDefaults(user);
      console.log("Google login user doc:", userData);

      setSuccess("Sikeres Google bejelentkezés!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page form-page">
      <h2>Bejelentkezés</h2>
      <form onSubmit={handleLogin} className="form-container">
        <input
          type="email"
          placeholder="Email cím"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Belépek</button>
      </form>

      <button type="button" onClick={handleGoogleLogin}>
        Google bejelentkezés
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
