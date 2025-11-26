export default function ChatMediaModal({ selectedMedia, onClose }) {
  if (!selectedMedia) return null;
  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content">
        {selectedMedia.type === "image" ? (
          <img src={selectedMedia.url} alt="Nagyított kép" />
        ) : (
          <video controls autoPlay>
            <source src={selectedMedia.url} type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
}