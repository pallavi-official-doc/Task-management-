import React, { useState, useEffect } from "react";
import API from "../../api/api";

const NewConversationModal = ({ show, onHide }) => {
  const [users, setUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await API.get("/auth/users");
        setUsers(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (show) loadUsers();
  }, [show]);

  const createConversation = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("receiverId", receiverId);
    formData.append("text", text);
    if (file) formData.append("file", file);

    await API.post("/messages/conversation", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // await API.post("/messages/conversation", {
    //   receiverId,
    //   text,
    // });

    onHide();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">New Conversation</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>

          <form onSubmit={createConversation}>
            <div className="modal-body">
              {/* ✅ Choose Member */}
              <div className="mb-3">
                <label className="form-label">
                  Choose Member <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  required
                >
                  <option value="">--</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ Message */}
              <div className="mb-3">
                <label className="form-label">
                  Message <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* ✅ File Upload */}
              <div className="mb-3">
                <label className="form-label">Add File</label>
                <div
                  className="border p-4 text-center bg-light rounded"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
              </div>
            </div>

            {/* ✅ Footer Buttons */}
            <div className="modal-footer">
              <button type="button" className="btn btn-light" onClick={onHide}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                ✔ Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
