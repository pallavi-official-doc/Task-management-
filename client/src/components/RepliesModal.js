import React from "react";
import { Modal, Button } from "react-bootstrap";

const RepliesModal = ({ show, onHide }) => {
  if (!show) return null;

  return (
    <Modal show onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Replies for Notice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {show.replies && show.replies.length > 0 ? (
          <div className="list-group">
            {show.replies.map((reply, index) => (
              <div
                key={index}
                className="list-group-item d-flex justify-content-between align-items-start"
              >
                <div>
                  <div className="fw-bold">
                    {reply.user?.name || "Employee"}
                  </div>
                  <div>{reply.message}</div>
                </div>
                <small className="text-muted">
                  {new Date(reply.date).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-center mb-0">
            No replies yet for this notice.
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RepliesModal;
