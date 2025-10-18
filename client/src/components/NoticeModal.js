import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import API from "../api/api";

const NoticeModal = ({ show, onHide, fetchNotices }) => {
  const [notice, setNotice] = useState(show.notice || "");
  const [to, setTo] = useState(show.to || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (show._id) await API.put(`/notices/${show._id}`, { notice, to });
    else await API.post("/notices", { notice, to });
    onHide();
    fetchNotices();
  };

  return (
    <Modal show onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{show._id ? "Edit Notice" : "Create Notice"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Notice</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notice}
              onChange={(e) => setNotice(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>To</Form.Label>
            <Form.Control
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </Form.Group>
          <Button className="mt-3" type="submit" variant="primary" block>
            Save
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default NoticeModal;
