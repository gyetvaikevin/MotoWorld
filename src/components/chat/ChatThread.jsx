// src/components/chat/ChatThread.jsx
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatMediaModal from "./ChatMediaModal";
import ChatModals from "./ChatModals";
import useConversation from "../../hooks/chat/useConversation";
import usePartner from "../../hooks/chat/usePartner";
import useCurrentUserData from "../../hooks/chat/useCurrentUserData";
import "../../styles/ChatThread.css";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function ChatThread({ conversation, onBack, onNavigateToConversation }) {
  const { user } = useAuth();
  const { messages, sendMessage } = useConversation(conversation, user);
  const partner = usePartner(conversation, user);
  const currentUserData = useCurrentUserData(user);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  return (
    <div className="chat-thread">
      <button onClick={onBack}>← Vissza</button>

      <ChatHeader
        convMeta={conversation}
        partner={partner}
        onEdit={() => setShowEditGroup(true)}
        onMembers={() => setShowMembers(true)}
        onAddMember={() => setShowAddMember(true)}
      />

      <ChatMessages
        messages={messages}
        convMeta={conversation}
        user={user}
        currentUserData={currentUserData}
        onSelectMedia={setSelectedMedia}
        partnerPhotoURL={partner?.photoURL || DEFAULT_AVATAR}
      />

      <ChatInput onSend={sendMessage} />

      <ChatMediaModal selectedMedia={selectedMedia} onClose={() => setSelectedMedia(null)} />

      <ChatModals
        convMeta={conversation}
        showAddMember={showAddMember}
        setShowAddMember={setShowAddMember}
        showEditGroup={showEditGroup}
        setShowEditGroup={setShowEditGroup}
        showMembers={showMembers}
        setShowMembers={setShowMembers}
        setConvMeta={() => {}} // itt nem kell frissíteni, mert a conversation prop jön felülről
      />
    </div>
  );
}