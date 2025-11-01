import React, { useState, useEffect, useContext } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import NewConversationModal from "./NewConversationModal";
import AuthContext from "../../context/AuthContext";
import API from "../../api/api";

const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadConversations = async () => {
    try {
      const res = await API.get("/messages/conversation");
      setConversations(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div
      className="container-fluid d-flex flex-column"
      style={{ height: "100vh", overflow: "hidden" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2 flex-shrink-0">
        <h4>Messages</h4>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowModal(true)}
        >
          + New Conversation
        </button>
      </div>

      {/* Content Body */}
      <div className="row flex-grow-1" style={{ overflow: "hidden" }}>
        {/* Sidebar */}
        <div className="col-3 border-end p-0" style={{ height: "100%" }}>
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            currentUser={user}
          />
        </div>

        {/* Chat Window */}
        <div
          className="col-9 p-0"
          style={{ height: "100%", overflow: "hidden" }}
        >
          <ChatWindow conversation={selectedConversation} />
        </div>
      </div>

      <NewConversationModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          loadConversations();
        }}
      />
    </div>
  );
};

export default MessagesPage;
