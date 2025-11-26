import AddMemberModal from "./AddMemberModal";
import EditGroupModal from "./EditGroupModal";
import GroupMembersModal from "./GroupMembersModal";

export default function ChatModals({
  convMeta,
  showAddMember,
  setShowAddMember,
  showEditGroup,
  setShowEditGroup,
  showMembers,
  setShowMembers,
  setConvMeta,
}) {
  return (
    <>
      {showAddMember && (
        <AddMemberModal
          convId={convMeta?.id}
          onClose={(result) => {
            setShowAddMember(false);
            if (result?.newConvId) {
              setConvMeta((prev) =>
                prev ? { ...prev, id: result.newConvId, isGroup: true } : prev
              );
            }
          }}
        />
      )}
      {showEditGroup && (
        <EditGroupModal
          convId={convMeta?.id}
          currentName={convMeta?.name}
          currentPhoto={convMeta?.photoURL}
          onClose={(updated) => {
            setShowEditGroup(false);
            if (updated) {
              setConvMeta((prev) =>
                prev
                  ? {
                      ...prev,
                      name: updated.name,
                      photoURL: updated.photoURL,
                      isGroup: true,
                    }
                  : prev
              );
            }
          }}
        />
      )}
      {showMembers && convMeta?.participants && (
        <GroupMembersModal
          participants={convMeta.participants}
          onClose={() => setShowMembers(false)}
        />
      )}
    </>
  );
}