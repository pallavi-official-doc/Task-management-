import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import API from "../../api/api";

import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, Dropdown } from "react-bootstrap";

const AppreciationPage = () => {
  const { user } = useContext(AuthContext);
  const [appreciations, setAppreciations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee: "",
    awardName: "",
    date: "",
    profession: "",
  });

  useEffect(() => {
    fetchAwards();
    if (user?.role === "admin" || user?.role === "hr") {
      fetchEmployees();
    }
  }, [user?.role]); // 👈 add dependency here

  const fetchAwards = async () => {
    try {
      const res = await API.get("/appreciations");
      setAppreciations(res.data);
    } catch (err) {
      console.error("Error fetching appreciations:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get("/users"); // assuming /users returns employee list
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/appreciations", formData);
      setShowModal(false);
      fetchAwards();
      setFormData({ employee: "", awardName: "", date: "", profession: "" });
    } catch (err) {
      console.error("Error creating award:", err);
    }
  };
  const handleEdit = (award) => {
    setShowModal(true);
    setFormData({
      employee: award.employee?._id || "",
      awardName: award.awardName,
      profession: award.profession,
      date: award.date.split("T")[0],
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this award?")) {
      try {
        await API.delete(`/appreciations/${id}`);
        fetchAwards();
      } catch (err) {
        console.error("Error deleting award:", err);
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Employee Awards</h4>
        {user?.role === "admin" || user?.role === "hr" ? (
          <Button variant="primary" onClick={() => setShowModal(true)}>
            + Create Award
          </Button>
        ) : null}
      </div>

      <div className="card p-3 shadow-sm">
        {/* <table className="table table-striped">
          <thead>
            <tr>
              <th>Given To</th>
              <th>Award Name</th>
              <th>Profession</th>
              <th>Given On</th>
            </tr>
          </thead>
          <tbody>
            {appreciations.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  No awards available
                </td>
              </tr>
            ) : (
              appreciations.map((award) => (
                <tr key={award._id}>
                  <td>{award.employee?.name}</td>
                  <td>{award.awardName}</td>
                  <td>{award.profession}</td>
                  <td>{new Date(award.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table> */}
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Given To</th>
              <th>Award Name</th>
              <th>Profession</th>
              <th>Given On</th>
              {/* 🟨 Add Action column header only for admin/hr */}
              {user?.role === "admin" || user?.role === "hr" ? (
                <th>Action</th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {appreciations.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    user?.role === "admin" || user?.role === "hr" ? 5 : 4
                  }
                  className="text-center text-muted"
                >
                  No awards available
                </td>
              </tr>
            ) : (
              appreciations.map((award) => (
                <tr key={award._id}>
                  <td>{award.employee?.name}</td>
                  <td>{award.awardName}</td>
                  <td>{award.profession}</td>
                  <td>{new Date(award.date).toLocaleDateString()}</td>

                  {/* 🟨 Action dropdown only for admin/hr */}
                  {user?.role === "admin" || user?.role === "hr" ? (
                    <td>
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="light"
                          id={`dropdown-${award._id}`}
                          className="border-0"
                        >
                          ⋮
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleEdit(award)}>
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() => handleDelete(award._id)}
                          >
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Award Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Award</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Employee</Form.Label>
              <Form.Select
                value={formData.employee}
                onChange={(e) =>
                  setFormData({ ...formData, employee: e.target.value })
                }
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Award Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter award name"
                value={formData.awardName}
                onChange={(e) =>
                  setFormData({ ...formData, awardName: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profession</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter profession"
                value={formData.profession}
                onChange={(e) =>
                  setFormData({ ...formData, profession: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="ms-2">
                Save
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AppreciationPage;
