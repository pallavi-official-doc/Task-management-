import React, { useState, useEffect } from "react";
import API from "../api/api";

const STATUS = ["Pending", "Upcoming", "Completed", "Cancelled"];

const AddEventModal = ({ show, onClose, onSaved, defaultDate }) => {
  const [form, setForm] = useState({
    title: "",
    color: "#0d6efd",
    location: "",
    description: "",
    startDate: "",
    startTime: "03:00 PM",
    endDate: "",
    endTime: "03:00 PM",
    assignedTo: [],
    host: "admin",
    client: "",
    status: "Pending",
    eventLink: "",
    file: null,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Users for selects
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // Prefill dates on open
    if (show) {
      const d = defaultDate ? new Date(defaultDate) : new Date();
      const iso = d.toISOString().slice(0, 10);
      setForm((f) => ({ ...f, startDate: iso, endDate: iso }));
      setError("");
    }
  }, [show, defaultDate]);

  useEffect(() => {
    // Fetch users and split by role
    API.get("/users")
      .then((res) => {
        const all = res.data || [];
        setEmployees(
          all.filter((u) => u.role === "employee" || u.role === "user")
        );
        setClients(all.filter((u) => u.role === "client"));
      })
      .catch((err) => console.error("Error fetching users", err));
  }, []);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm((f) => ({ ...f, file: files?.[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onChangeAssign = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setForm((f) => ({ ...f, assignedTo: selected }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.title.trim()) return setError("Event name is required.");
    if (!form.startDate || !form.endDate)
      return setError("Start/End dates are required.");

    // Build multipart form
    const fd = new FormData();
    Object.entries({
      title: form.title.trim(),
      color: form.color,
      location: form.location,
      description: form.description?.trim() || "",
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
      setSaving(true);
      await API.post("/events", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSaving(false);
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      setSaving(false);
      setError(err?.response?.data?.message || "Failed to save event.");
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1050 }}
        aria-modal="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={onSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Add Event</h5>
                <button type="button" className="btn-close" onClick={onClose} />
              </div>

              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger py-2">{error}</div>
                )}

                {/* Row 1: name, color, where */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Event Name *</label>
                    <input
                      className="form-control"
                      name="title"
                      value={form.title}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Label Color *</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      name="color"
                      value={form.color}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Where</label>
                    <input
                      className="form-control"
                      name="location"
                      value={form.location}
                      onChange={onChange}
                      placeholder="Office / Zoom / Address"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={onChange}
                  />
                </div>

                {/* Dates & times */}
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Starts On Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="startDate"
                      value={form.startDate}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Starts On Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      name="startTime"
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
                    <label className="form-label">Ends On Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="endDate"
                      value={form.endDate}
                      onChange={onChange}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Ends On Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      name="endTime"
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

                {/* Assign employees */}
                <div className="mb-3">
                  <label className="form-label">Select Employee(s)</label>
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
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Host *</label>
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
                    <div className="col-md-5 mb-3">
                      <label className="form-label">Client</label>
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

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Status</label>
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
                </div>

                {/* Link + File */}
                <div className="row">
                  <div className="col-md-8 mb-3">
                    <label className="form-label">Event Link</label>
                    <input
                      className="form-control"
                      name="eventLink"
                      value={form.eventLink}
                      onChange={onChange}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Add File</label>
                    <input
                      type="file"
                      className="form-control"
                      name="file"
                      onChange={onChange}
                    />
                    <div className="form-text">
                      Max 5MB. Allowed: pdf/doc/jpg/png
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// helpers to convert between 12h and 24h display for <input type="time">
function to24(amPm) {
  // "03:00 PM" -> "15:00"
  if (!amPm) return "09:00";
  const [time, modifier] = amPm.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (modifier?.toUpperCase() === "PM" && h < 12) h += 12;
  if (modifier?.toUpperCase() === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function toAmPm(hhmm) {
  // "15:00" -> "03:00 PM"
  if (!hhmm) return "09:00 AM";
  let [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(
    2,
    "0"
  )} ${suffix}`;
}

export default AddEventModal;
