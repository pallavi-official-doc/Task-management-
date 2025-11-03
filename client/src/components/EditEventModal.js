// src/components/EditEventModal.jsx
import React, { useState, useEffect } from "react";
import API from "../api/api";

const STATUS = ["Pending", "Upcoming", "Completed", "Cancelled"];

const EditEventModal = ({ show, event, onClose, onUpdated }) => {
  // ---------------- Hooks must be first ----------------
  const [form, setForm] = useState({
    title: "",
    color: "#0d6efd",
    location: "",
    description: "",
    startDate: "",
    startTime: "09:00 AM",
    endDate: "",
    endTime: "09:00 AM",
    assignedTo: [],
    host: "admin",
    client: "",
    status: "Pending",
    eventLink: "",
    file: null,
  });

  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);

  const to24 = (time) => {
    if (!time) return "09:00";
    const [t, mod] = time.split(" ");
    let [h, m] = t.split(":").map(Number);
    if (mod === "PM" && h < 12) h += 12;
    if (mod === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const toAmPm = (val) => {
    if (!val) return "09:00 AM";
    const [h, m] = val.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${String(hr).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )} ${suffix}`;
  };

  // ✅ Load employees + clients list once
  useEffect(() => {
    API.get("/users")
      .then((res) => {
        const all = res.data || [];
        setEmployees(
          all.filter((u) => u.role === "employee" || u.role === "user")
        );
        setClients(all.filter((u) => u.role === "client"));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!event) {
      return; // fallback to empty form
    }

    const ext = event.extendedProps || {};
    const start =
      event.start instanceof Date ? event.start.toISOString() : event.start;
    const end = event.end instanceof Date ? event.end.toISOString() : event.end;

    setForm({
      title: event.title || "",
      color: event.backgroundColor || event.color || "#0d6efd",
      location: ext.location || "",
      description: ext.description || "",

      startDate: start?.split("T")[0] || "",
      startTime: toAmPm(start?.split("T")[1]?.slice(0, 5) || "09:00"),
      endDate: end?.split("T")[0] || "",
      endTime: toAmPm(end?.split("T")[1]?.slice(0, 5) || "09:00"),

      assignedTo: ext.assignedTo?.map((u) => u._id) || [],
      host: ext.host || "admin",
      client: ext.client?._id || "",
      status: ext.status || "Pending",
      eventLink: ext.eventLink || "",
      file: null,
    });
  }, [event]);

  // ✅ This must be AFTER hooks
  if (!show || !event) return null;

  // ---------------- Event Handlers ----------------
  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((f) => ({ ...f, file: files?.[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onChangeAssign = (e) => {
    setForm((f) => ({
      ...f,
      assignedTo: Array.from(e.target.selectedOptions, (opt) => opt.value),
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries({
      title: form.title,
      color: form.color,
      location: form.location,
      description: form.description,
      startDate: form.startDate,
      startTime: form.startTime,
      endDate: form.endDate,
      endTime: form.endTime,
      host: form.host,
      client: form.host === "client" ? form.client : "",
      status: form.status,
      eventLink: form.eventLink,
    }).forEach(([k, v]) => fd.append(k, v));

    form.assignedTo.forEach((id) => fd.append("assignedTo", id));
    if (form.file) fd.append("file", form.file);

    try {
      await API.put(`/events/${event.id}`, fd);
      onUpdated && onUpdated();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  // ---------------- UI ----------------
  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />
      <div className="modal fade show d-block" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={submitHandler}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Event</h5>
                <button type="button" className="btn-close" onClick={onClose} />
              </div>

              <div className="modal-body">
                {/* Name / Color / Location */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Event Name *</label>
                    <input
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label>Color</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      name="color"
                      value={form.color}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label>Location</label>
                    <input
                      className="form-control"
                      name="location"
                      value={form.location}
                      onChange={onChange}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={onChange}
                  />
                </div>

                {/* Date & Time */}
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="startDate"
                      value={form.startDate}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label>Start Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={to24(form.startTime)}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          startTime: toAmPm(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="endDate"
                      value={form.endDate}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label>End Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={to24(form.endTime)}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          endTime: toAmPm(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Assign Employees */}
                <div className="mb-3">
                  <label>Assign Employee(s)</label>
                  <select
                    multiple
                    className="form-control"
                    value={form.assignedTo}
                    onChange={onChangeAssign}
                  >
                    {employees.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Host / Client */}
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label>Host</label>
                    <select
                      className="form-control"
                      name="host"
                      value={form.host}
                      onChange={onChange}
                    >
                      <option value="admin">Admin</option>
                      <option value="client">Client</option>
                    </select>
                  </div>

                  {form.host === "client" && (
                    <div className="col-md-8 mb-3">
                      <label>Client</label>
                      <select
                        className="form-control"
                        name="client"
                        value={form.client}
                        onChange={onChange}
                      >
                        <option value="">Select client</option>
                        {clients.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="mb-3">
                  <label>Status</label>
                  <select
                    className="form-control"
                    name="status"
                    value={form.status}
                    onChange={onChange}
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Link + File */}
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label>Event Link</label>
                    <input
                      className="form-control"
                      name="eventLink"
                      value={form.eventLink}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label>Upload File</label>
                    <input
                      type="file"
                      name="file"
                      className="form-control"
                      onChange={onChange}
                    />
                    <div className="form-text">
                      Leave empty to keep existing file
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Update Event
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditEventModal;
