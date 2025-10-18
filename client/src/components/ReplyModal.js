import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import API from "../api/api";

const ReplyModal = ({ show, onHide, fetchNotices }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await API.post(`/notices/${show._id}/reply`, { message });
    onHide();
    fetchNotices();
  };

  return (
    <Modal show onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Reply to Notice</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Your Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </Form.Group>
          <Button className="mt-3" type="submit" variant="primary" block>
            Send Reply
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReplyModal;
