import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../Context/AuthContext";
import Loader from "../Loader";
import Message from "../Message";

function ProfilePage() {
  const { logout } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [appData, setAppData] = useState({ total: 0, list: [] });

  // Auto clear message after 3 sec
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch("/api/profile/");
        const data = await res.json();

        setForm({
          username: data.username,
          email: data.email,
        });

        setAppData({
          total: data.total_applicants,
          list: data.applicants,
        });
      } catch {
        setMessage("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/profile/", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("✅ Profile updated successfully");
      } else {
        const data = await res.json();
        setMessage(data.error || "Profile update failed");
      }
    } catch {
      setMessage("Error updating profile");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/profile/change-password/", {
        method: "PUT",
        body: JSON.stringify(passwordData),
      });

      if (res.ok) {
        alert("Password changed! Login again.");
        logout();
      } else {
        const data = await res.json();
        setMessage(data.error || "Error changing password");
      }
    } catch {
      setMessage("Error changing password");
    }
  };

  if (loading) return <Loader text="Loading Profile..." />;

  return (
    <div className="container mt-5">

      <h3 className="mb-3">My Profile</h3>
      {message && <Message variant="info">{message}</Message>}

      <div className="row">
        
        <div className="col-md-6 mb-4">
          <h5>Account Details</h5>
          <form onSubmit={updateProfile}>
            <div className="mb-2">
              <label>Username</label>
              <input className="form-control" value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}/>
            </div>

            <div className="mb-2">
              <label>Email</label>
              <input className="form-control" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}/>
            </div>

            <button className="btn btn-primary mt-2" type="submit">Update Profile</button>
          </form>
        </div>

        <div className="col-md-6 mb-4">
          <h5>Change Password</h5>
          <form onSubmit={changePassword}>
            <div className="mb-2">
              <label>Old Password</label>
              <input type="password" className="form-control"
                onChange={e => setPasswordData({ ...passwordData, old_password: e.target.value })}/>
            </div>

            <div className="mb-2">
              <label>New Password</label>
              <input type="password" className="form-control"
                onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}/>
            </div>

            <button className="btn btn-warning mt-2" type="submit">Change Password</button>
          </form>
        </div>
      </div>

      <hr />

      <h5>My Applicants ({appData.total})</h5>
      <ul className="list-group mt-2">
        {appData.list.map(a => (
          <li className="list-group-item" key={a.id}>
            #{a.id} — {a.Applicant_Name}
          </li>
        ))}
      </ul>

    </div>
  );
}

export default ProfilePage;