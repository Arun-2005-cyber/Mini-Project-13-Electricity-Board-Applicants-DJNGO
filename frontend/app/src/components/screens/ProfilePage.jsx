import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { useAuth } from "../../Context/AuthContext";
import Loader from "../Loader";
import Message from "../Message";

function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [appData, setAppData] = useState({ total: 0, list: [] });

  // ✅ Clear messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ✅ Fetch profile when page loads
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch("/api/profile/");
        const data = await res.json();

        if (res.ok) {
          setForm({
            username: data.username,
            email: data.email,
          });
          
          setAppData({
            total: data.total_applicants|| 0,
            list: data.applicants || [],
          });
        } else {
          setMessage(data.error || "Failed to load profile");
        }
      } catch (error) {
        setMessage("Error fetching profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  // ✅ Loader until profile is fully fetched
  if (loading || !user) {
    return <Loader text="Loading Profile..." />;
  }

  // ✅ Update profile handler
  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch("/api/profile/", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        updateUser({
          username: data.username || form.username,
          email: data.email || form.email,
        });

        setMessage("✅ Profile updated successfully!");
      } else {
        setMessage(data.error || "Profile update failed");
      }
    } catch {
      setMessage("Error updating profile");
    }
  };

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
              <input
                className="form-control"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label>Email</label>
              <input
                className="form-control"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <button className="btn btn-primary mt-2" type="submit">
              Update Profile
            </button>
          </form>
        </div>
      </div>

      <hr />

      <h5>My Applicants ({appData.total})</h5>
      <ul className="list-group mt-2">
        {appData.list.length === 0 && (
          <li className="list-group-item text-muted">
            No applicants found
          </li>
        )}

        {appData.list.map((a) => (
          <li className="list-group-item" key={a.id}>
            #{a.id} — {a.Applicant_Name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfilePage;
