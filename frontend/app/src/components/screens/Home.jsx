import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner } from 'react-bootstrap';
import './Home.css';
import Datepicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link, useLocation } from 'react-router-dom';
import API_URL from "../../config";

function Home() {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMsg) {
      setSuccessMsg(location.state.successMsg);
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    fetchData();
  }, [currentPage, startDate, endDate, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/getApplicantsData/?page=${currentPage}`;
      if (startDate && endDate) {
        url += `&start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`;
      }
      if (searchQuery) url += `&search=${searchQuery}`;
      const response = await fetch(url);
      const jsonData = await response.json();

      setData(jsonData.data || []);
      setTotalPages(jsonData.total_pages || 1);
      setCurrentPage(jsonData.current_page || 1);
      setTotalItems(jsonData.total_items || 0);
    } catch (error) {
      console.error("Failed to fetch API:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-3">
      <h3>Applicants Details</h3>
      <hr />

      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" /> <p>Loading data...</p>
        </div>
      )}

      {!loading && (
        <>
          <Row className='mb-3'>
            <p>Filter by the Date of Application</p>
            <Col md={2}>
              <Datepicker selected={startDate} className="form-control" onChange={setStartDate} placeholderText="From Date" />
            </Col>
            <Col md={2}>
              <Datepicker selected={endDate} className="form-control" onChange={setEndDate} placeholderText="To Date" />
            </Col>
            <Col md={3}></Col>
            <Col md={5}>
              <input
                type="text"
                className='form-control'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search by applicant ID or name'
              />
            </Col>
          </Row>

          <div className="table-container">
            <table className='table table-bordered table-striped'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant Name</th>
                  <th>Gender</th>
                  <th>District</th>
                  <th>State</th>
                  <th>Pincode</th>
                  <th>Ownership</th>
                  <th>Govt_ID_Type</th>
                  <th>ID_Number</th>
                  <th>Category</th>
                  <th>Load_Applied</th>
                  <th>Date_of_Application</th>
                  <th>Status</th>
                  <th>Reviewer_ID</th>
                  <th>Reviewer_Name</th>
                  <th>Reviewer_Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((connection) => (
                  <tr key={connection.id}>
                    <td>{connection.id}</td>
                    <td>{connection.Applicant.Applicant_Name}</td>
                    <td>{connection.Applicant.Gender}</td>
                    <td>{connection.Applicant.District}</td>
                    <td>{connection.Applicant.State}</td>
                    <td>{connection.Applicant.Pincode}</td>
                    <td>{connection.Applicant.Ownership}</td>
                    <td>{connection.Applicant.GovtID_Type}</td>
                    <td>{connection.Applicant.ID_Number}</td>
                    <td>{connection.Applicant.Category}</td>
                    <td>{connection.Load_Applied}</td>
                    <td>{connection.Date_of_Application}</td>
                    <td>{connection.Status}</td>
                    <td>{connection.Reviewer_ID}</td>
                    <td>{connection.Reviewer_Name}</td>
                    <td>{connection.Reviewer_Comments}</td>
                    <td className="text-center">
                      <Link
                        className="btn btn-outline-primary w-100"
                        to={`/EditApplicant/${connection.id}`}
                      >
                        <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
