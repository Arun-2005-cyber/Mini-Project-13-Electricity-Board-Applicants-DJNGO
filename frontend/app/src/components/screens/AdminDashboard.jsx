// src/screens/AdminScreen.js
import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Form, InputGroup, Pagination } from "react-bootstrap";
import API_URL from "../config";

const AdminDashboard = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");

const userData = JSON.parse(localStorage.getItem("user"));
const token = userData?.token;
const isAdmin = userData?.is_admin;


  useEffect(() => {
    if (!token || isAdmin !== "true") {
      alert("Unauthorized! Only admin can access this page.");
      return;
    }
    fetchApplicants();
  }, [page, searchTerm, filter]);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/admin/applicants/?page=${page}`;
      if (searchTerm) url += `&search=${searchTerm}`;
      if (filter !== "all") url += `&search=${filter}`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch applicants");
      const data = await res.json();

      setApplicants(data.results || []);
      setTotalPages(Math.ceil(data.count / 10));
    } catch (err) {
      console.error("Error loading applicants:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicantStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/applicants/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        alert(`Applicant ${status} successfully!`);
        fetchApplicants(); // refresh after update
      } else {
        const errData = await res.json();
        alert("Failed to update: " + (errData.detail || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error updating applicant");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Admin Panel</h2>
        <Button variant="danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="d-flex mb-3">
        <InputGroup className="me-3">
          <Form.Control
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
          />
        </InputGroup>

        <Form.Select
          style={{ width: "200px" }}
          value={filter}
          onChange={(e) => {
            setPage(1);
            setFilter(e.target.value);
          }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Form.Select>
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Applicant Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length > 0 ? (
                applicants.map((applicant) => (
                  <tr key={applicant.id}>
                    <td>{applicant.id}</td>
                    <td>{applicant.name}</td>
                    <td>{applicant.email}</td>
                    <td>{applicant.status}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() =>
                          updateApplicantStatus(applicant.id, "approved")
                        }
                        disabled={applicant.status === "approved"}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          updateApplicantStatus(applicant.id, "rejected")
                        }
                        disabled={applicant.status === "rejected"}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={i + 1 === page}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
