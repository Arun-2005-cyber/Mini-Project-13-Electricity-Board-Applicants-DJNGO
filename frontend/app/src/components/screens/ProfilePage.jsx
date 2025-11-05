import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";  // adjust path if needed
import { useAuth } from "../../Context/AuthContext";
import Loader from "../Loader";
import Message from "../Message";

function ProfilePage() {
  const { logout } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await apiFetch("/api/profile/");
        const data = await res.json();
        setForm(data);
      } catch (err) {
        setMessage("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // ✅ Update Profile
  const updateProfile = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await apiFetch("/api/profile/", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("✅ Profile updated successfully!");
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || "Profile update failed");
      }
    } catch {
      setMessage("Error updating profile");
    }
  };

  // ✅ Change Password
  const changePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await apiFetch("/api/profile/change-password/", {
        method: "PUT",
        body: JSON.stringify(passwordData),
      });

      if (res.ok) {
        alert("Password changed! Please login again.");
        logout();
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || "Password change failed");
      }
    } catch {
      setMessage("Error changing password");
    }
  };

  if (loading) return <Loader text="Loading Profile..." />;

  return (
    <div className="container mt-5">
      <h3>User Profile</h3>

      {message && <Message variant="info">{message}</Message>}

      <form className="col-md-6" onSubmit={updateProfile}>
        <div className="mb-2">
          <label>Username</label>
          <input className="form-control" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}/>
        </div>

        <div className="mb-2">
          <label>First Name</label>
          <input className="form-control" value={form.first_name}
            onChange={e => setForm({ ...form, first_name: e.target.value })}/>
        </div>

        <div className="mb-2">
          <label>Last Name</label>
          <input className="form-control" value={form.last_name}
            onChange={e => setForm({ ...form, last_name: e.target.value })}/>
        </div>

        <div className="mb-2">
          <label>Email</label>
          <input className="form-control" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}/>
        </div>

        <button className="btn btn-primary mt-2" type="submit">Update Profile</button>
      </form>

      <hr className="my-4" />

      <h4>Change Password</h4>
      <form className="col-md-6" onSubmit={changePassword}>
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

        <button className="btn btn-warning mt-2">Change Password</button>
      </form>
    </div>
  );
}

export default ProfilePage;
