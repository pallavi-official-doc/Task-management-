import React, { useEffect, useState, useContext, useCallback } from "react";
import API from "../api/api";
import AuthContext from "../context/AuthContext";
import NoticeModal from "../components/NoticeModal";
import ReplyModal from "../components/ReplyModal";
import RepliesModal from "../components/RepliesModal";

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);

  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [showModal, setShowModal] = useState(false); // Create/Edit notice
  const [showReply, setShowReply] = useState(null); // Employee reply modal
  const [showReplies, setShowReplies] = useState(null); // Admin view replies

  /* -------------------- FETCH NOTICES (SERVER SIDE) -------------------- */
  const fetchNotices = useCallback(
    async (pageNum = page, limitNum = entries) => {
      try {
        const params = {
          page: pageNum,
          limit: limitNum,
          search,
          startDate: dateRange.start || "",
          endDate: dateRange.end || "",
        };

        const res = await API.get("/notices", { params });
        setNotices(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error("Error fetching notices:", err);
      }
    },
    [page, entries, search, dateRange]
  );

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure to delete this notice?")) {
      await API.delete(`/notices/${id}`);
      fetchNotices();
    }
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="container mt-4">
      <h4 className="mb-3">📢 Notice Board</h4>

      {/* Filter Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          <label className="fw-bold me-1">Duration:</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
          />
          <span className="mx-2">to</span>
          <input
            type="date"
            className="form-control form-control-sm"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
          />
        </div>

        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="🔍 Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {user.role === "admin" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowModal(true)}
            >
              + Create Notice
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Notice</th>
            <th>Date</th>
            <th>To</th>
            <th style={{ width: "230px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {notices.length > 0 ? (
            notices.map((n) => (
              <tr key={n._id}>
                <td>{n.notice}</td>
                <td>{new Date(n.date).toLocaleDateString()}</td>
                <td>{n.to}</td>
                <td>
                  {user.role === "admin" ? (
                    <>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => setShowModal(n)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger me-2"
                        onClick={() => handleDelete(n._id)}
                      >
                        Delete
                      </button>

                      {/* 🆕 View Replies */}
                      {n.replies && n.replies.length > 0 && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setShowReplies(n)}
                        >
                          View Replies ({n.replies.length})
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => setShowReply(n)}
                    >
                      Reply
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No data available in table
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <label className="me-2">Show</label>
          <select
            className="form-select form-select-sm w-auto"
            value={entries}
            onChange={(e) => setEntries(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((num) => (
              <option key={num}>{num}</option>
            ))}
          </select>
          <span className="ms-2">entries</span>
        </div>

        <div>
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary ms-2"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-2 text-muted small text-end">
        Showing {(page - 1) * entries + 1} to {Math.min(page * entries, total)}{" "}
        of {total} entries
      </div>

      {/* Modals */}
      {showModal && (
        <NoticeModal
          show={showModal}
          onHide={() => setShowModal(false)}
          fetchNotices={fetchNotices}
        />
      )}

      {showReply && (
        <ReplyModal
          show={showReply}
          onHide={() => setShowReply(null)}
          fetchNotices={fetchNotices}
        />
      )}

      {showReplies && (
        <RepliesModal show={showReplies} onHide={() => setShowReplies(null)} />
      )}
    </div>
  );
};

export default NoticeBoard;
