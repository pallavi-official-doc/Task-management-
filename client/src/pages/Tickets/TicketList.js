import React, { useEffect, useState, useContext } from "react";
import { BsFilter } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import AuthContext from "../../context/AuthContext";
import CreateTicketModal from "./CreateTicketModal";

const TicketList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch tickets from server
  const fetchTickets = async (filter = status) => {
    try {
      const res = await API.get(`/tickets?status=${filter}`);
      setTickets(res.data);
    } catch (error) {
      console.log("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ✅ Stats
  const stats = {
    total: tickets.length,
    closed: tickets.filter((x) => x.status === "Closed").length,
    open: tickets.filter((x) => x.status === "Open").length,
    pending: tickets.filter((x) => x.status === "Pending").length,
    resolved: tickets.filter((x) => x.status === "Resolved").length,
  };

  // ✅ Filter on click of box
  const setStatusFilter = (value) => {
    setStatus(value);
    fetchTickets(value);
  };

  // ✅ Update ticket status
  const updateStatus = async (id, stat) => {
    try {
      await API.put(`/tickets/${id}/status`, { status: stat });
      fetchTickets();
    } catch (err) {
      console.log("Status update error", err);
    }
  };

  // ✅ Delete ticket (Admin only)
  const deleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;
    await API.delete(`/tickets/${id}`);
    fetchTickets();
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold">Tickets</h4>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Create Ticket
        </button>
      </div>

      {/* Filters */}
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Tickets</option>
            <option value="Open">Open Tickets</option>
            <option value="Pending">Pending Tickets</option>
            <option value="Resolved">Resolved Tickets</option>
            <option value="Closed">Closed Tickets</option>
          </select>
        </div>

        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Start typing to search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-1 d-flex align-items-center">
          <BsFilter size={20} className="cursor-pointer" />
        </div>
      </div>

      {/* Stats Boxes */}
      <div className="row g-3 mb-4">
        {[
          ["Total Tickets", stats.total, "All"],
          ["Closed Tickets", stats.closed, "Closed"],
          ["Open Tickets", stats.open, "Open"],
          ["Pending Tickets", stats.pending, "Pending"],
          ["Resolved Tickets", stats.resolved, "Resolved"],
        ].map(([label, value, f], i) => (
          <div className="col-md-2" key={i}>
            <div
              className="card shadow-sm p-3 text-center cursor-pointer"
              onClick={() => setStatusFilter(f)}
              style={{ cursor: "pointer" }}
            >
              <h6 className="text-muted">{label}</h6>
              <h4 className="fw-bold">{value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="table-responsive card p-3 shadow-sm">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Subject</th>
              <th>Requester</th>
              <th>Requested On</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No tickets found
                </td>
              </tr>
            ) : (
              tickets
                .filter((t) =>
                  t.subject.toLowerCase().includes(search.toLowerCase())
                )
                .map((ticket) => (
                  <tr key={ticket._id}>
                    <td>{ticket.ticketId}</td>
                    <td>{ticket.subject}</td>
                    <td>{ticket.requester?.name}</td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>{ticket.assignedTo?.name || "--"}</td>

                    {/* ✅ Status dropdown */}
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={ticket.status}
                        onChange={(e) =>
                          updateStatus(ticket._id, e.target.value)
                        }
                      >
                        {[
                          "Open",
                          "Pending",
                          "In Progress",
                          "Resolved",
                          "Closed",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* ✅ Action Menu */}
                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-light"
                          data-bs-toggle="dropdown"
                        >
                          ⋮
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                navigate(`/dashboard/tickets/${ticket._id}`)
                              }
                            >
                              View
                            </button>
                          </li>

                          {user.role === "admin" && (
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => deleteTicket(ticket._id)}
                              >
                                Delete
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
        <CreateTicketModal
          show={showModal}
          onHide={() => setShowModal(false)}
          refresh={fetchTickets}
        />
      )}
    </div>
  );
};

export default TicketList;
