import React, { useEffect, useState, useContext } from "react";
import API from "../../api/api";
import AuthContext from "../../context/AuthContext";

const ProfileSettings = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    title: "Mr",
    name: "",
    email: "",
    password: "",
    mobile: "",
    country: "India",
    gender: "",
    maritalStatus: "",
    dob: "",
    slackId: "",
    language: "English",
    emailNotifications: true,
    googleCalendar: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      setProfile((prev) => ({
        ...prev,
        ...res.data,
      }));
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.put("/users/profile", profile);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      alert("❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      try {
        await API.delete(`/users/${user._id}`);
        alert("🗑️ Profile deleted successfully!");
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <div className="container bg-white shadow-sm p-4 rounded">
      <h4 className="mb-4 fw-bold">Profile Settings</h4>

      <form onSubmit={handleSubmit}>
        {/* Profile Picture */}
        <div className="mb-4">
          <label className="form-label">Profile Picture</label>
          <div
            className="border rounded d-flex justify-content-center align-items-center"
            style={{
              width: "150px",
              height: "150px",
              backgroundColor: "#f8f9fa",
            }}
          >
            <i className="fa fa-user fa-4x text-muted"></i>
          </div>
        </div>

        {/* Name & Email */}
        <div className="row g-3">
          <div className="col-md-2">
            <label className="form-label">Title</label>
            <select
              className="form-select"
              name="title"
              value={profile.title}
              onChange={handleChange}
            >
              <option>Mr</option>
              <option>Mrs</option>
              <option>Ms</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Your Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={profile.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Your Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled
            />
          </div>
        </div>

        {/* Password */}
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label className="form-label">Your Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Must have at least 8 characters"
              value={profile.password}
              onChange={handleChange}
            />
            <small className="text-muted">
              Leave blank to keep current password
            </small>
          </div>

          <div className="col-md-6">
            <label className="form-label">Country</label>
            <select
              className="form-select"
              name="country"
              value={profile.country}
              onChange={handleChange}
            >
              <option value="India">🇮🇳 India</option>
              <option value="USA">🇺🇸 USA</option>
              <option value="UK">🇬🇧 UK</option>
            </select>
          </div>
        </div>

        {/* Mobile / Gender / Marital / DOB */}
        <div className="row g-3 mt-2">
          <div className="col-md-6">
            <label className="form-label">Mobile</label>
            <input
              type="text"
              className="form-control"
              name="mobile"
              value={profile.mobile}
              onChange={handleChange}
              placeholder="+91 9876543210"
            />
          </div>

          {/* Designation and Employee Code */}
          <div className="row g-3 mt-3">
            <div className="col-md-6">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-control"
                name="designation"
                value={profile.designation || ""}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                className="form-control"
                name="employeeCode"
                value={profile.employeeCode || ""}
                onChange={handleChange}
                placeholder="e.g. EMP123"
              />
            </div>
          </div>

          <div className="col-md-3">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              name="gender"
              value={profile.gender}
              onChange={handleChange}
            >
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Marital Status</label>
            <select
              className="form-select"
              name="maritalStatus"
              value={profile.maritalStatus}
              onChange={handleChange}
            >
              <option>Single</option>
              <option>Married</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              name="dob"
              value={profile.dob ? profile.dob.split("T")[0] : ""}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Slack Member ID</label>
            <input
              type="text"
              className="form-control"
              name="slackId"
              value={profile.slackId}
              onChange={handleChange}
              placeholder="@username"
            />
          </div>
        </div>

        {/* Language & Notifications */}
        <div className="row g-3 mt-3">
          <div className="col-md-4">
            <label className="form-label">Change Language</label>
            <select
              className="form-select"
              name="language"
              value={profile.language}
              onChange={handleChange}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Marathi</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label d-block">
              Receive email notifications?
            </label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="emailNotifications"
                  className="form-check-input"
                  value={true}
                  checked={profile.emailNotifications === true}
                  onChange={() =>
                    setProfile({ ...profile, emailNotifications: true })
                  }
                />
                <label className="form-check-label">Enable</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="emailNotifications"
                  className="form-check-input"
                  value={false}
                  checked={profile.emailNotifications === false}
                  onChange={() =>
                    setProfile({ ...profile, emailNotifications: false })
                  }
                />
                <label className="form-check-label">Disable</label>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label d-block">Enable Google Calendar</label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="googleCalendar"
                  className="form-check-input"
                  value={true}
                  checked={profile.googleCalendar === true}
                  onChange={() =>
                    setProfile({ ...profile, googleCalendar: true })
                  }
                />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  name="googleCalendar"
                  className="form-check-input"
                  value={false}
                  checked={profile.googleCalendar === false}
                  onChange={() =>
                    setProfile({ ...profile, googleCalendar: false })
                  }
                />
                <label className="form-check-label">No</label>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            Delete Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
