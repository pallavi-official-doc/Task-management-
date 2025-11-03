import React from "react";

const EventDetailModal = ({
  show,
  event,
  onClose,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  if (!show || !event) return null;

  const ext = event.extendedProps || {};
  const assigned = ext.assignedTo || [];

  // Format date + time display
  const formatDT = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />

      <div
        className="modal fade show d-block"
        style={{ zIndex: 1050 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">{event.title}</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="mb-2">
                <strong>Date & Time: </strong>
                <br />
                {formatDT(event.start)} ({ext.startTime}) →{" "}
                {formatDT(event.end)} ({ext.endTime})
              </div>

              {ext.location && (
                <div className="mb-2">
                  <strong>Location:</strong> {ext.location}
                </div>
              )}

              {ext.status && (
                <div className="mb-2">
                  <strong>Status: </strong>{" "}
                  <span
                    className={`badge ${
                      ext.status === "Completed"
                        ? "bg-success"
                        : ext.status === "Cancelled"
                        ? "bg-danger"
                        : "bg-primary"
                    }`}
                  >
                    {ext.status}
                  </span>
                </div>
              )}

              <div className="mb-2">
                <strong>Host:</strong>{" "}
                {ext.host === "admin" ? "Admin" : "Client"}
              </div>

              {ext.host === "client" && ext.client?.name && (
                <div className="mb-2">
                  <strong>Client:</strong> {ext.client.name}
                </div>
              )}

              {ext.description && (
                <div className="mb-3">
                  <strong>Description:</strong> <br />
                  {ext.description}
                </div>
              )}

              <div className="mb-2">
                <strong>Assigned Employees:</strong>
                <ul className="mt-1">
                  {assigned.length > 0 ? (
                    assigned.map((u) => <li key={u._id}>{u.name}</li>)
                  ) : (
                    <li>None</li>
                  )}
                </ul>
              </div>

              {ext.eventLink && (
                <div className="mb-2">
                  <strong>Event Link:</strong>{" "}
                  <a
                    href={ext.eventLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ext.eventLink}
                  </a>
                </div>
              )}

              {ext.filePath && (
                <div className="mt-2">
                  <strong>File: </strong>
                  <a
                    href={`http://localhost:5000${ext.filePath}`}
                    download
                    className="btn btn-sm btn-outline-primary ms-2"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Close
              </button>

              {isAdmin && (
                <>
                  <button className="btn btn-warning" onClick={onEdit}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={onDelete}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetailModal;
