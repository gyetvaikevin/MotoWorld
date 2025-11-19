🔐 Firestore szabályok
Users

Bárki olvashatja a felhasználói profilokat.

Létrehozás: csak az adott uid hozhatja létre a saját profilját, és csak ha még nem létezik.

Update/Delete: csak a saját uid módosíthatja vagy törölheti.

FriendRequests (régi logika)

A küldő (fromUid) hozhat létre requestet.

A címzett (uid) olvashatja és törölheti.

A küldő olvashatja a saját request dokumentumát.

Friends

Csak a saját barátlistádat olvashatod.

Létrehozás: engedélyezett, ha az auth user az egyik fél (uid vagy friendUid).

Törlés: ugyanígy, bármelyik fél törölheti.

Notifications

Létrehozás: csak a küldő (senderId).

Olvasás: csak a címzett (receiverId).

Update: csak a címzett.

Posts / Events / Marketplace

Publikus olvasás.

Létrehozás: csak a createdByUid.

Update: csak a szerző, vagy like mező változtatása.

Delete: csak a szerző.

Kommentek: bárki olvashatja, létrehozás/törlés csak a szerző.

Chat / Conversations

Olvasás: csak a résztvevők.

Létrehozás: auth usernek benne kell lennie a participants listában.

Update/Delete: csak résztvevők.

Messages: csak résztvevők olvashatják.

Létrehozás: csak a senderId, és mindkét félnek benne kell lennie a participants listában.

Delete: csak a küldő.

💬 Chat funkciók
ChatInput.jsx

Egyszerű input mező, amivel üzenetet lehet küldeni.

onSend callbacket hívja meg.

ChatList.jsx

Megjeleníti a beszélgetések listáját.

Lekéri a partner adatait Firestore‑ból (users kollekció).

Cache‑eli a user adatokat, hogy ne kelljen újra lekérni.

ChatSidebar.jsx

Oldalsáv, ahol beszélgetéseket lehet indítani vagy meglévőket kiválasztani.

Keresőmező: név/email alapján keres usereket.

Ha találat van, új beszélgetést lehet indítani.

Ha nincs keresés, a meglévő beszélgetések listája látszik.

ChatThread.jsx

Egy konkrét beszélgetés üzeneteit jeleníti meg.

Lekéri a partner adatait.

Scroll automatikusan a legutolsó üzenetre.

ChatInput segítségével lehet új üzenetet küldeni.

ChatWindow.jsx

Teljes beszélgetés ablak.

Lekéri a conversation metaadatokat (résztvevők, createdAt).

Lekéri a partner adatait.

Snapshotban figyeli az üzeneteket, és valós időben frissíti.

Üzenetküldés: addDoc a messages alkollekcióba.

NewChat.jsx

Új beszélgetés indítása keresés alapján.

Lekéri a usereket users kollekcióból.

Ha találat van, új conversation indul.

Értesítést (notifyUser) küld a partnernek.

📝 Komment funkciók
CommentForm.jsx

Input mező komment írásához.

onSubmit callbacket hívja.

CommentItem.jsx

Egy komment megjelenítése.

Ha a user a szerző, törölheti.

Comments.jsx

Lekéri és snapshotban figyeli a kommenteket.

Új komment létrehozása: addDoc.

Törlés: deleteDoc.

Értesítést küld a poszt/esemény szerzőjének, ha más ír kommentet.

⚙️ Közös komponensek
LoaderWrapper.jsx

Betöltés közben sportmotoros kép + szöveg.

MapPicker.jsx

Leaflet alapú térkép.

Dupla kattintással megálló hozzáadása.

OSRM útvonaltervezés a megállók között.

Megállókhoz popup jelenik meg.

🔔 Értesítések
notifyUser util

Új dokumentumot hoz létre a notifications kollekcióban.

Tartalmazza: type, senderId, senderName, senderPhoto, receiverId, relatedId, createdAt.

Használják: barátkérés, üzenetküldés, kommentelés.

📋 Összefoglaló
Ez a program egy motoros közösségi platform:

Felhasználói profilok kezelése.

Barátkérések és barátlista.

Értesítések minden fontos eseményről (barátkérés, üzenet, komment).

Chat rendszer: beszélgetések, üzenetek valós időben.

Posztok és események: létrehozás, kommentelés, like.

Marketplace: hirdetések.

Térképes útvonaltervezés motoros túrákhoz.



ENGLISH:
🔐 Firestore Rules
Users
Anyone can read user profiles.

Create: only the user with the given UID can create their own profile, and only if it does not already exist.

Update/Delete: only the owner (same UID) can modify or delete their profile.

Friend Requests (legacy logic)
Create: only the sender (fromUid) can create a request.

Read/Delete: only the recipient (uid) can read or delete the request.

Additionally, the sender can read their own request document.

Friends
Read: only the owner can read their own friend list.

Create: allowed if the authenticated user is one of the parties (uid or friendUid).

Delete: either party can remove the friendship.

Notifications
Create: only the sender (senderId).

Read: only the recipient (receiverId).

Update: only the recipient.

Posts / Events / Marketplace
Public read access.

Create: only the createdByUid.

Update: only the author, or when modifying the likes field.

Delete: only the author.

Comments: anyone can read, but only the author can create or delete their own comment.

Chat / Conversations
Read: only participants.

Create: the authenticated user must be included in the participants list.

Update/Delete: only participants.

Messages: only participants can read.

Create: only the senderId, and both sender and receiver must be in the participants list.

Delete: only the sender.

💬 Chat Features
ChatInput.jsx
Simple input field for sending messages.

Calls the onSend callback.

ChatList.jsx
Displays the list of conversations.

Fetches partner data from Firestore (users collection).

Caches user data to avoid repeated queries.

ChatSidebar.jsx
Sidebar for starting new conversations or selecting existing ones.

Search field: find users by name/email.

If results are found, a new conversation can be started.

If no search, existing conversations are listed.

ChatThread.jsx
Displays messages of a specific conversation.

Fetches partner data.

Automatically scrolls to the latest message.

Uses ChatInput to send new messages.

ChatWindow.jsx
Full conversation window.

Loads conversation metadata (participants, createdAt).

Fetches partner data.

Listens to messages via snapshot, updates in real time.

Sending messages: addDoc to the messages subcollection.

NewChat.jsx
Start a new conversation based on search.

Queries users from the users collection.

If results are found, a new conversation is created.

Sends a notification (notifyUser) to the partner.

📝 Comment Features
CommentForm.jsx
Input field for writing comments.

Calls the onSubmit callback.

CommentItem.jsx
Displays a single comment.

If the current user is the author, they can delete it.

Comments.jsx
Fetches and listens to comments via snapshot.

Create new comment: addDoc.

Delete: deleteDoc.

Sends a notification to the post/event author if someone else comments.

⚙️ Shared Components
LoaderWrapper.jsx
Displays a loading screen with a motorcycle image + text.

MapPicker.jsx
Leaflet‑based map.

Double‑click to add a stop.

OSRM route planning between stops.

Popups appear for each stop.

🔔 Notifications
notifyUser util
Creates a new document in the notifications collection.

Contains: type, senderId, senderName, senderPhoto, receiverId, relatedId, createdAt.

Used for: friend requests, messages, comments.

📋 Summary
This project is a motorcycle community platform with the following features:

User profile management.

Friend requests and friend list.

Notifications for all important events (friend request, message, comment).

Real‑time chat system: conversations and messages.

Posts and events: creation, commenting, likes.

Marketplace: listings.

Map‑based route planning for motorcycle tours.