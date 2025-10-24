import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config";

function AdminDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        const token = userData?.token || userData?.access;

        const res = await axios.get(`${API_URL}/api/admin/applicants/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setApplicants(res.data);
      } catch (err) {
        setError("⚠️ Unauthorized or session expired. Please log in again.");
        navigate("/login");
      }
    };

    fetchApplicants();
  }, [navigate]);

  return (
    <div className="container mt-5">
      <h2>Admin - Applicants List</h2>
      {error && <p className="text-danger">{error}</p>}
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((app) => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.name}</td>
              <td>{app.email}</td>
              <td>{app.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default AdminDashboard;
