import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const ConversationList = ({
  conversations,
  setSelectedConversation,
  selectedConversation,
  currentUser,
}) => {
  return (
    <div className="list-group h-100 overflow-auto">
      {conversations.map((c) => {
        const otherUser = c.members.find((m) => m._id !== currentUser?._id);
        const avatarSrc =
          otherUser?.gender === "male"
            ? "/avatars/male.png"
            : "/avatars/female.png";
        return (
          <button
            key={c._id}
            className={`list-group-item list-group-item-action border-0 ${
              selectedConversation?._id === c._id ? "active" : ""
            }`}
            onClick={() => setSelectedConversation(c)}
            style={{
              background:
                selectedConversation?._id === c._id ? "#eef7ff" : "#fff",
            }}
          >
            <div className="d-flex align-items-center">
              {/* Avatar */}
              <img
                src={avatarSrc}
                alt="avatar"
                width="40"
                height="40"
                className="rounded-circle me-2"
              />

              <div className="flex-grow-1 text-start">
                {/* Name */}
                <div className="fw-bold">{otherUser?.name}</div>

                {/* Last Message */}
                <div
                  className="text-muted small"
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    maxWidth: "180px",
                  }}
                >
                  {c.lastMessage || "Start conversation"}
                </div>
              </div>

              {/* Time */}
              <div className="text-muted small ms-1">
                {c.lastMessageTime ? dayjs(c.lastMessageTime).fromNow() : ""}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
