import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../Context/AuthContext";
import Loader from "../Loader";
import Message from "../Message";

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ username: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [appData, setAppData] = useState({ total: 0, list: [] });

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "info" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch("/api/profile/");
        const data = await res.json();

        if (res.ok) {
          setForm({ username: data.username, email: data.email });
          setAppData({ total: data.total_applicants || 0, list: data.applicants || [] });
        } else {
          setMessage({ text: data.error || "Failed to load profile", type: "danger" });
        }
      } catch {
        setMessage({ text: "Error fetching profile", type: "danger" });
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch("/api/profile/", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        updateUser({ username: data.username || form.username, email: data.email || form.email });
        setMessage({ text: "✅ Profile updated successfully!", type: "success" });
      } else {
        setMessage({ text: data.error || "Profile update failed", type: "danger" });
      }
    } catch {
      setMessage({ text: "Error updating profile", type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !message.text) return <Loader text="Loading Profile..." />;

  return (
    <div className="container mt-5">
      <h3 className="mb-3">Admin Dashboard</h3>
      {message.text && <Message variant={message.type}>{message.text}</Message>}

      <div className="row">
        <div className="col-md-6 mb-4">
          <h5>Account Details</h5>
          <form onSubmit={updateProfile}>
            <div className="mb-2">
              <label>Username</label>
              <input
                className="form-control"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label>Email</label>
              <input
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <button className="btn btn-primary mt-2" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>

      <hr />
      <h5>Recent Applicants ({appData.total})</h5>
      <p className="text-muted">Admin can view and edit all recent applications below.</p>

      <ul className="list-group mt-2">
        {appData.list.length === 0 ? (
          <li className="list-group-item text-muted">No recent applicants found</li>
        ) : (
          appData.list.map((a) => (
            <li className="list-group-item" key={a.id}>
              #{a.id} — {a.Applicant_Name}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ProfilePage;
