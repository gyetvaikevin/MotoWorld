// src/pages/Friends.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useFriends } from "../contexts/FriendContext";
import { useAuth } from "../contexts/AuthContext";
import Fuse from "fuse.js";
import "../styles/Friends.css";

import FriendButton from "../components/friends/FriendButton";
import FriendListItem from "../components/friends/FriendListItem";
import FriendRequestItem from "../components/friends/FriendRequestItem";

function Friends() {
  const { firebaseUser } = useAuth();
  const uid = firebaseUser?.uid;
  const { friends, requests } = useFriends();

  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllUsers(users);
    };
    fetchUsers();
  }, []);

  // handle Fuse search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const fuse = new Fuse(allUsers, {
      keys: ["displayName", "email"],
      threshold: 0.3,
    });
    const results = fuse.search(searchTerm).map((r) => r.item);
    setSearchResults(results.filter((u) => u.id !== uid));
  };

  if (!uid) return null;

  return (
    <div className="friends-page">
      <h2>Barátok és keresés</h2>

      {/* Search form */}
      <form onSubmit={handleSearch} className="friend-search-form">
        <input
          type="text"
          placeholder="Felhasználó keresése név vagy email alapján..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Keresés</button>
      </form>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="friend-search-results">
          <h3>Keresési találatok</h3>
          <ul>
            {searchResults.map((u) => (
              <li key={u.id} className="friend-item">
                {u.photoURL && <img src={u.photoURL} alt={u.displayName} />}
                <span>{u.displayName || u.email}</span>

                {/* dynamic button shows Ismerősök / Ismerősnek jelölve / Elfogadás / Ismerősnek jelöl */}
                <FriendButton profileUid={u.id} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Your existing friends list */}
      <h3>Barátaim</h3>
      {friends.length === 0 ? (
        <p>Nincsenek barátaid.</p>
      ) : (
        <ul className="friends-list">
          {friends.map((friendUid) => (
            <FriendListItem key={friendUid} uid={friendUid} />
          ))}
        </ul>
      )}

      {/* Incoming friend requests */}
      <h3>Beérkező barátkérések</h3>
      {requests.length === 0 ? (
        <p>Nincsenek beérkező kéréseid.</p>
      ) : (
        <ul className="friend-requests-list">
          {requests.map((req) => (
            <FriendRequestItem key={req.id} req={req} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default Friends;
