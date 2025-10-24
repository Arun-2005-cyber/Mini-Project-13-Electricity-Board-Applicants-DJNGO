import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Table } from 'react-bootstrap';
import API_URL from "../../config";
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [msg, setMsg] = useState('');

  const fetchApplicants = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const res = await axios.get(`${API_URL}/api/admin/applicants/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplicants(res.data);
    } catch (err) {
      setMsg('❌ Failed to fetch applicants');
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const deleteApplicant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this applicant?')) return;
    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      await axios.delete(`${API_URL}/api/admin/applicant/${id}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg('✅ Applicant deleted successfully');
      fetchApplicants();
    } catch (err) {
      setMsg('❌ Delete failed');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Dashboard</h2>
      <p>{msg}</p>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map(app => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.name}</td>
              <td>{app.address}</td>
              <td>{app.email}</td>
              <td>{app.phone}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => deleteApplicant(app.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Link to="/" className="btn btn-secondary">Back</Link>
    </div>
  );
}

export default AdminDashboard;
