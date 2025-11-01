// import React, { useEffect, useState, useRef, useContext } from "react";
// import AuthContext from "../../context/AuthContext";
// import { socket } from "../../socket";
// import API from "../../api/api";
// import EmojiPicker from "emoji-picker-react";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// dayjs.extend(relativeTime);

// const isImage = (url = "") => /\.(png|jpe?g|gif|webp)$/i.test(url);

// const ChatWindow = ({ conversation, onlineUsers }) => {
//   const { user } = useContext(AuthContext);
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [file, setFile] = useState(null);
//   const [filePreview, setFilePreview] = useState(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const [showEmoji, setShowEmoji] = useState(false);
//   const bottomRef = useRef(null);

//   const playSound = () => new Audio("/sounds/notify.mp3").play();

//   const otherUser = conversation
//     ? conversation.members.find((m) => m._id !== user._id)
//     : null;

//   const avatarSrc =
//     otherUser?.gender === "male" ? "/avatars/male.png" : "/avatars/female.png";

//   const loadMessages = async () => {
//     if (!conversation) return;
//     const res = await API.get(
//       `/messages/conversation/${conversation._id}/messages`
//     );
//     setMessages(res.data);
//   };

//   // ✅ Delete Message function
//   const deleteMessage = async (id) => {
//     await API.delete(`/messages/message/${id}`);

//     setMessages((prev) =>
//       prev.map((m) =>
//         m._id === id
//           ? {
//               ...m,
//               isDeleted: true,
//               text: "",
//               file: null,
//               deletedText: "This message was deleted",
//             }
//           : m
//       )
//     );
//   };

//   // ✅ Listen to socket events
//   useEffect(() => {
//     if (!conversation) return;

//     loadMessages();

//     socket.on("newMessage", (msg) => {
//       if (msg.conversationId === conversation._id) {
//         if (msg.sender._id !== user._id) playSound();
//         setMessages((prev) => [...prev, msg]);
//         setTimeout(
//           () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
//           100
//         );
//       }
//     });

//     socket.on("typing", ({ from }) => {
//       if (from === otherUser?._id) {
//         setIsTyping(true);
//         setTimeout(() => setIsTyping(false), 2000);
//       }
//     });

//     socket.on("messageDeleted", ({ messageId }) => {
//       setMessages((prev) =>
//         prev.map((m) =>
//           m._id === messageId
//             ? {
//                 ...m,
//                 isDeleted: true,
//                 text: "",
//                 file: null,
//                 deletedText: "This message was deleted",
//               }
//             : m
//         )
//       );
//     });

//     return () => {
//       socket.off("newMessage");
//       socket.off("typing");
//       socket.off("messageDeleted");
//     };
//   }, [conversation]);

//   // ✅ send message
//   const sendMessage = async () => {
//     if (!conversation) return;

//     const form = new FormData();
//     form.append("conversationId", conversation._id);
//     form.append("text", text);
//     if (file) form.append("file", file);

//     await API.post("/messages/message", form);

//     setText("");
//     setFile(null);
//     setFilePreview(null);
//     loadMessages();
//   };

//   if (!conversation) {
//     return (
//       <div className="d-flex justify-content-center align-items-center h-100 text-muted fs-5">
//         Select a conversation to chat
//       </div>
//     );
//   }

//   return (
//     // <div className="d-flex flex-column h-100 p-2 position-relative">
//     <div
//       className="d-flex flex-column p-2 position-relative"
//       style={{ height: "100%", overflow: "hidden" }}
//     >
//       {/* Header */}
//       <div className="d-flex align-items-center border-bottom pb-2 mb-2">
//         <img src={avatarSrc} width="45" className="rounded-circle me-2" />
//         <div>
//           <h6 className="m-0">{otherUser?.name}</h6>
//           <div className="text-muted small">
//             {onlineUsers?.includes(otherUser._id)
//               ? "Online"
//               : `Last seen ${dayjs(otherUser?.lastSeen).fromNow()}`}
//           </div>

//           {isTyping && <div className="text-success small">typing...</div>}
//         </div>
//       </div>

//       {/* Messages */}
//       {/* <div className="flex-grow-1 border rounded p-3 mb-2 overflow-auto bg-white"> */}
//       <div
//         className="flex-grow-1 border rounded p-3 mb-2 bg-white"
//         style={{ overflowY: "auto" }}
//       >
//         {messages.map((msg) => {
//           const isMine = msg.sender?._id === user._id;

//           return (
//             <div key={msg._id} className="mb-3">
//               <div
//                 className={`small fw-bold ${
//                   isMine ? "text-primary" : "text-success"
//                 }`}
//               >
//                 {msg.sender?.name}
//               </div>

//               {/* ✅ Deleted Message UI */}
//               {msg.isDeleted ? (
//                 <div
//                   className="fst-italic text-muted small"
//                   style={{ maxWidth: "70%" }}
//                 >
//                   {msg.deletedText}
//                 </div>
//               ) : (
//                 msg.text && (
//                   <div
//                     className="p-2 mb-1"
//                     style={{
//                       maxWidth: "70%",
//                       border: "1px solid #ddd",
//                       borderRadius: "6px",
//                       background: "#fafafa",
//                       alignSelf: isMine ? "flex-end" : "flex-start",
//                     }}
//                   >
//                     {msg.text}
//                   </div>
//                 )
//               )}

//               {/* ✅ Show delete button for only my messages */}
//               {isMine && !msg.isDeleted && (
//                 <button
//                   className="btn btn-sm text-danger"
//                   onClick={() => deleteMessage(msg._id)}
//                 >
//                   🗑
//                 </button>
//               )}

//               {/* File Preview */}
//               {msg.file && !msg.isDeleted && (
//                 <div className={`mt-1 ${isMine ? "text-end" : ""}`}>
//                   {isImage(msg.file) ? (
//                     <a href={msg.file} target="_blank" rel="noreferrer">
//                       <img
//                         src={msg.file}
//                         alt="file"
//                         style={{ maxWidth: 200, borderRadius: 8 }}
//                       />
//                     </a>
//                   ) : (
//                     <a
//                       href={msg.file}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="btn btn-sm btn-outline-secondary"
//                     >
//                       📎 Download file
//                     </a>
//                   )}
//                 </div>
//               )}

//               {/* Status ticks */}
//               {isMine && !msg.isDeleted && (
//                 <div className="small text-muted ms-1">
//                   {msg.status === "sent" && "✔"}
//                   {msg.status === "delivered" && "✔✔"}
//                   {msg.status === "seen" && (
//                     <span style={{ color: "#4ade80" }}>✔✔</span>
//                   )}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//         <div ref={bottomRef} />
//       </div>

//       {/* Input row */}
//       <div className="d-flex gap-2" style={{ flexShrink: 0 }}>
//         <button
//           className="btn btn-light"
//           onClick={() => setShowEmoji(!showEmoji)}
//         >
//           😃
//         </button>

//         <input
//           className="form-control"
//           value={text}
//           onChange={(e) => {
//             setText(e.target.value);
//             socket.emit("typing", { from: user._id, to: otherUser._id });
//           }}
//           placeholder="Type a message..."
//         />

//         <input
//           type="file"
//           className="form-control"
//           onChange={(e) => {
//             const f = e.target.files[0];
//             setFile(f);
//             if (f && f.type.startsWith("image/")) {
//               setFilePreview(URL.createObjectURL(f));
//             } else {
//               setFilePreview(null);
//             }
//           }}
//           style={{ maxWidth: 150 }}
//         />

//         <button className="btn btn-primary" onClick={sendMessage}>
//           Send
//         </button>
//       </div>

//       {/* File Preview */}
//       {filePreview && (
//         <div className="mt-2">
//           <img src={filePreview} height="80" style={{ borderRadius: 8 }} />
//         </div>
//       )}

//       {/* Emoji Picker */}
//       {showEmoji && (
//         <div style={{ position: "absolute", bottom: 65, right: 20 }}>
//           <EmojiPicker
//             onEmojiClick={(emoji) => setText((prev) => prev + emoji.emoji)}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWindow;
import React, { useEffect, useState, useRef, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { socket } from "../../socket";
import API from "../../api/api";
import EmojiPicker from "emoji-picker-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const isImage = (url = "") => /\.(png|jpe?g|gif|webp)$/i.test(url);

const ChatWindow = ({ conversation, onlineUsers }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);

  const playSound = () => new Audio("/sounds/notify.mp3").play();

  const otherUser = conversation
    ? conversation.members.find((m) => m._id !== user._id)
    : null;

  const avatarSrc =
    otherUser?.gender === "male" ? "/avatars/male.png" : "/avatars/female.png";

  const loadMessages = async () => {
    if (!conversation) return;
    const res = await API.get(
      `/messages/conversation/${conversation._id}/messages`
    );
    setMessages(res.data);
  };

  const deleteMessage = async (id) => {
    await API.delete(`/messages/message/${id}`);

    setMessages((prev) =>
      prev.map((m) =>
        m._id === id
          ? {
              ...m,
              isDeleted: true,
              text: "",
              file: null,
              deletedText: "This message was deleted",
            }
          : m
      )
    );
  };

  useEffect(() => {
    if (!conversation) return;
    loadMessages();

    socket.on("newMessage", (msg) => {
      if (msg.conversationId === conversation._id) {
        if (msg.sender._id !== user._id) playSound();
        setMessages((prev) => [...prev, msg]);
        setTimeout(
          () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      }
    });

    socket.on("typing", ({ from }) => {
      if (from === otherUser?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                isDeleted: true,
                text: "",
                file: null,
                deletedText: "This message was deleted",
              }
            : m
        )
      );
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
      socket.off("messageDeleted");
    };
  }, [conversation]);

  const sendMessage = async () => {
    if (!conversation) return;

    const form = new FormData();
    form.append("conversationId", conversation._id);
    form.append("text", text);
    if (file) form.append("file", file);

    await API.post("/messages/message", form);

    setText("");
    setFile(null);
    setFilePreview(null);
    loadMessages();
  };

  if (!conversation) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 text-muted fs-5">
        Select a conversation to chat
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column p-2 position-relative"
      style={{ height: "100%", overflow: "hidden" }}
    >
      {/* Header */}
      <div className="d-flex align-items-center border-bottom pb-2 mb-2">
        <img src={avatarSrc} width="45" className="rounded-circle me-2" />
        <div>
          <h6 className="m-0">{otherUser?.name}</h6>
          <div className="text-muted small">
            {onlineUsers?.includes(otherUser._id)
              ? "Online"
              : `Last seen ${dayjs(otherUser?.lastSeen).fromNow()}`}
          </div>

          {isTyping && <div className="text-success small">typing...</div>}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-grow-1 border rounded p-3 mb-2 bg-white"
        style={{ overflowY: "auto" }}
      >
        {messages.map((msg) => {
          const isMine = msg.sender?._id === user._id;

          return (
            <div key={msg._id} className="mb-3">
              <div
                className={`small fw-bold ${
                  isMine ? "text-primary" : "text-success"
                }`}
              >
                {msg.sender?.name}
              </div>

              {msg.isDeleted ? (
                <div
                  className="fst-italic text-muted small"
                  style={{ maxWidth: "70%" }}
                >
                  {msg.deletedText}
                </div>
              ) : (
                msg.text && (
                  <div
                    className="p-2 mb-1"
                    style={{
                      maxWidth: "70%",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      background: "#fafafa",
                      alignSelf: isMine ? "flex-end" : "flex-start",
                    }}
                  >
                    {msg.text}
                  </div>
                )
              )}

              {isMine && !msg.isDeleted && (
                <button
                  className="btn btn-sm text-danger"
                  onClick={() => deleteMessage(msg._id)}
                >
                  🗑
                </button>
              )}

              {msg.file && !msg.isDeleted && (
                <div className={`mt-1 ${isMine ? "text-end" : ""}`}>
                  {isImage(msg.file) ? (
                    <a href={msg.file} target="_blank" rel="noreferrer">
                      <img
                        src={msg.file}
                        alt="file"
                        style={{ maxWidth: 200, borderRadius: 8 }}
                      />
                    </a>
                  ) : (
                    <a
                      href={msg.file}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      📎 Download file
                    </a>
                  )}
                </div>
              )}

              {isMine && !msg.isDeleted && (
                <div className="small text-muted ms-1">
                  {msg.status === "sent" && "✔"}
                  {msg.status === "delivered" && "✔✔"}
                  {msg.status === "seen" && (
                    <span style={{ color: "#4ade80" }}>✔✔</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="d-flex gap-2" style={{ flexShrink: 0 }}>
        <button
          className="btn btn-light"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          😃
        </button>

        <input
          className="form-control"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket.emit("typing", { from: user._id, to: otherUser._id });
          }}
          placeholder="Type a message..."
        />

        <input
          type="file"
          className="form-control"
          onChange={(e) => {
            const f = e.target.files[0];
            setFile(f);
            if (f && f.type.startsWith("image/")) {
              setFilePreview(URL.createObjectURL(f));
            } else {
              setFilePreview(null);
            }
          }}
          style={{ maxWidth: 150 }}
        />

        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>

      {filePreview && (
        <div className="mt-2">
          <img src={filePreview} height="80" style={{ borderRadius: 8 }} />
        </div>
      )}

      {showEmoji && (
        <div style={{ position: "absolute", bottom: 65, right: 20 }}>
          <EmojiPicker
            onEmojiClick={(emoji) => setText((prev) => prev + emoji.emoji)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
