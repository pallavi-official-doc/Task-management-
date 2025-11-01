import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/api";
import {
  BsArrowLeftShort,
  BsDownload,
  BsSend,
  BsPaperclip,
} from "react-icons/bs";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [file, setFile] = useState(null);

  const fetchTicket = async () => {
    try {
      const res = await axios.get(`/tickets/${id}`);
      setTicket(res.data.ticket);
      setComments(res.data.comments);
    } catch (err) {
      console.log("Error fetching ticket details", err);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);
  useEffect(() => {
    const refresh = () => fetchTicket();
    window.addEventListener("ticketCommentRefresh", refresh);
    return () => window.removeEventListener("ticketCommentRefresh", refresh);
  }, []);

  const handleStatusChange = async (e) => {
    try {
      await axios.put(`/tickets/${id}/status`, { status: e.target.value });
      fetchTicket();
    } catch (err) {
      console.log("Status update error", err);
    }
  };

  const sendComment = async () => {
    if (!newComment.trim() && !file) return;

    try {
      const fd = new FormData();
      fd.append("comment", newComment);
      if (file) fd.append("file", file);

      await axios.post(`/tickets/${id}/comments`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewComment("");
      setFile(null);
      fetchTicket();
    } catch (err) {
      console.log("Comment send error:", err);
    }
  };

  if (!ticket) return <div>Loading...</div>;

  return (
    <div className="container p-3">
      {/* Back button */}
      <button
        className="btn btn-outline-primary mb-3"
        onClick={() => navigate(-1)}
      >
        <BsArrowLeftShort size={22} /> Back
      </button>

      {/* Ticket Header */}
      <div className="card shadow-sm p-3 mb-4">
        <h4 className="fw-bold">{ticket.subject}</h4>
        <p className="text-muted">Ticket ID: {ticket.ticketId}</p>

        <div className="row mt-3">
          <div className="col-md-4 mb-2">
            <strong>Requester:</strong> {ticket.requester?.name}
          </div>
          <div className="col-md-4 mb-2">
            <strong>Assigned To:</strong> {ticket.assignedTo?.name || "--"}
          </div>
          <div className="col-md-4 mb-2">
            <strong>Project:</strong> {ticket.project?.name || "--"}
          </div>

          <div className="col-md-4 mt-2">
            <strong>Status: </strong>
            <select
              className="form-select d-inline w-auto"
              value={ticket.status}
              onChange={handleStatusChange}
            >
              <option>Open</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </div>
        </div>

        {ticket.files && (
          <div className="mt-3">
            <strong>Attachment:</strong> &nbsp;
            <a
              href={ticket.files}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-success"
            >
              <BsDownload /> Download
            </a>
          </div>
        )}

        <div className="mt-3">
          <strong>Description:</strong>
          <p className="mt-2">{ticket.description}</p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="card shadow-sm p-3">
        <h5 className="fw-bold mb-3">Discussion</h5>

        <div
          className="chat-box mb-3"
          style={{ maxHeight: 350, overflowY: "auto" }}
        >
          {comments.length === 0 && (
            <p className="text-muted">No comments yet.</p>
          )}

          {comments.map((msg) => (
            <div
              key={msg._id}
              className={`p-2 mb-2 rounded ${
                msg.sender._id === ticket.requester?._id
                  ? "bg-light"
                  : "bg-primary text-white"
              }`}
            >
              <strong>{msg.sender.name}: </strong> {msg.comment}
              {msg.file && (
                <div className="mt-1">
                  <a
                    href={msg.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-warning"
                  >
                    📎 View Attachment
                  </a>
                </div>
              )}
              <div>
                <small className="text-muted">
                  {new Date(msg.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input */}
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Write a message..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          {/* File input icon */}
          <label className="input-group-text" style={{ cursor: "pointer" }}>
            <BsPaperclip />
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <button className="btn btn-primary" onClick={sendComment}>
            <BsSend />
          </button>
        </div>

        {file && (
          <div className="mt-2 text-muted">📎 File selected: {file.name}</div>
        )}
      </div>
    </div>
  );
};

export default TicketDetails;
