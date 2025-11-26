import UserNameLink from "../profile/UserNameLink";

const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png";

export default function ChatHeader({ convMeta, partner, onEdit, onMembers, onAddMember }) {
  return (
    <div className="chat-header">
      {convMeta?.isGroup ? (
        <>
          <img
            src={convMeta?.photoURL || DEFAULT_GROUP_AVATAR}
            alt={convMeta?.name || "Csoport"}
            className="chat-header-avatar"
          />
          <h3 className="chat-header-name">
            {convMeta?.name || "Névtelen csoport"}
            <button className="edit-group-btn" onClick={onEdit}>✎</button>
            <button className="members-btn" onClick={onMembers}>👥</button>
          </h3>
        </>
      ) : (
        <>
          <img
            src={partner?.photoURL || DEFAULT_AVATAR}
            alt={partner?.displayName || "Partner"}
            className="chat-header-avatar"
          />
          <h3 className="chat-header-name">
            {partner?.id ? (
              <UserNameLink uid={partner.id} displayName={partner.displayName} />
            ) : "Betöltés..."}
          </h3>
        </>
      )}
      <button className="add-member-btn" onClick={onAddMember}>+</button>
    </div>
  );
}