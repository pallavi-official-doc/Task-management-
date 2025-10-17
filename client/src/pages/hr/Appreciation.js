import React, { useEffect, useState, useContext, useCallback } from "react";
import AuthContext from "../../context/AuthContext";
import API from "../../api/api";

const AppreciationPage = () => {
  const { user } = useContext(AuthContext);
  const [appreciations, setAppreciations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [awardName, setAwardName] = useState("");

  const isAdmin = user?.role === "admin";

  // ✅ Wrap with useCallback
  const fetchAppreciations = useCallback(async () => {
    const endpoint = isAdmin ? "/appreciations" : "/appreciations/my";
    const res = await API.get(endpoint);
    setAppreciations(res.data);
  }, [isAdmin]);

  const fetchUsers = useCallback(async () => {
    if (isAdmin) {
      const res = await API.get("/users");
      setUsers(res.data);
    }
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedUser || !awardName) return;
    await API.post("/appreciations", {
      givenTo: selectedUser,
      awardName,
    });
    setSelectedUser("");
    setAwardName("");
    fetchAppreciations(); // ✅ will work fine
  };

  useEffect(() => {
    fetchAppreciations();
    fetchUsers();
  }, [fetchAppreciations, fetchUsers]); // ✅ clean dependency array

  return (
    <div className="appreciation-container">
      <h3>Appreciation</h3>

      {/* Admin-only Create Form */}
      {isAdmin && (
        <form className="create-appreciation-form" onSubmit={handleCreate}>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select Employee</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Award Name"
            value={awardName}
            onChange={(e) => setAwardName(e.target.value)}
          />

          <button type="submit">Create</button>
        </form>
      )}

      {/* Appreciation Table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Given To</th>
            <th>Award Name</th>
            <th>Given On</th>
          </tr>
        </thead>
        <tbody>
          {appreciations.length > 0 ? (
            appreciations.map((a) => (
              <tr key={a._id}>
                <td>{a.givenTo?.name}</td>
                <td>{a.awardName}</td>
                <td>{new Date(a.givenOn).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No data available in table
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AppreciationPage;
