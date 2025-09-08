import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import './Home.css';
import Datepicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import API_URL from "../../config";
  // ✅ Import API URL from config.js

function Home() {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);   // ✅ fixed typo (endtDate → endDate)
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage, startDate, endDate, searchQuery]);

  const fetchData = async () => {
    try {
      // ✅ use API_URL instead of localhost
      let url = `${API_URL}/api/getApplicantsData/?page=${currentPage}`;

      if (startDate && endDate) {
        url += `&start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`;
      }

      if (searchQuery) {
        url += `&search=${searchQuery}`;
      }

      const response = await fetch(url);
      const jsonData = await response.json();
      console.log("API JSON Response:", jsonData);

      setData(jsonData.data || []);
      setTotalPages(jsonData.total_pages || 1);
    } catch (error) {
      console.error("Failed to fetch API:", error);
    }
  };

  const handleSearchChange = (event) => setSearchQuery(event.target.value);
  const handleStartDateChange = (date) => setStartDate(date);
  const handleEndDateChange = (date) => setEndDate(date);
  const handleFirstPageClick = () => setCurrentPage(1);
  const handleLastPageClick = () => setCurrentPage(totalPages);
  const handlePageClick = (page) => setCurrentPage(page);

  return (
    <div className="container mt-3">
      <h3>Applicants Details</h3>
      <hr />

      <Row className='mb-3'>
        <p>Filter by the Date of Application</p>
        <Col md={2}>
          <Datepicker
            selected={startDate}
            className="form-control date"
            onChange={handleStartDateChange}
            placeholderText="From Date"
          />
        </Col>
        <Col md={2}>
          <Datepicker
            selected={endDate}
            className="form-control date"
            onChange={handleEndDateChange}
            placeholderText="To Date"
          />
        </Col>

        <Col md={3}></Col>
        <Col md={5}>
          <input
            type="text"
            className='form-control'
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder='Search by applicant ID'
          />
        </Col>
      </Row>

      <div className="table-container">
        <table className='table table-bordered'>
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
            {data?.map((connection) => (
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
                    className="btn custom-edit-btn btn-outline-primary w-100"
                    title="Edit"
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

      <div className="container mt-3">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button onClick={handleFirstPageClick} className='page-link'>
              Go to First
            </button>
          </li>
          {Array.from({ length: totalPages }).map((_, index) => (
            <li
              key={index}
              className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
            >
              <button onClick={() => handlePageClick(index + 1)} className='page-link'>
                {index + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button onClick={handleLastPageClick} className='page-link'>
              Go to Last
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
