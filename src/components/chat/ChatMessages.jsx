const DEFAULT_AVATAR = "/default-avatar.png";

export default function ChatMessages({
  messages,
  convMeta,
  user,
  currentUserData,
  onSelectMedia,
  partnerPhotoURL,
}) {
  return (
    <div className="chat-messages-inner">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`chat-message ${msg.senderId === user?.uid ? "self" : "partner"}`}
        >
          <img
            src={
              msg.senderId === user?.uid
                ? currentUserData?.photoURL || DEFAULT_AVATAR
                : convMeta?.isGroup
                ? msg.senderPhotoURL || DEFAULT_AVATAR
                : partnerPhotoURL || DEFAULT_AVATAR
            }
            alt="avatar"
            className="chat-avatar"
          />
          {(!msg.type || msg.type === "text") && <div className="bubble">{msg.text}</div>}
          {msg.type === "image" && (
            <img
              src={msg.mediaUrl}
              alt="kép"
              className="chat-media"
              onClick={() => onSelectMedia({ url: msg.mediaUrl, type: "image" })}
            />
          )}
          {msg.type === "video" && (
            <video
              controls
              className="chat-media"
              onClick={() => onSelectMedia({ url: msg.mediaUrl, type: "video" })}
            >
              <source src={msg.mediaUrl} type="video/mp4" />
            </video>
          )}
        </div>
      ))}
    </div>
  );
}