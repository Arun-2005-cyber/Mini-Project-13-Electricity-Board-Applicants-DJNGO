import React, { useState, useEffect } from 'react';
import { Row, Col, Alert, Spinner, Button } from 'react-bootstrap';
import './Home.css';
import Datepicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link, useLocation } from 'react-router-dom';
import API_URL from "../../config";
import axios from 'axios';

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
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();


const handleSearch = async () => {
  const snoRegex = /^\d+$/;

  if (snoRegex.test(searchQuery)) {
    const sno = parseInt(searchQuery, 10);

    // 🔹 Compute which page this S.No belongs to
    const itemsPerPage = 10;
    const targetPage = Math.ceil(sno / itemsPerPage);

    // 🔹 Update page (trigger useEffect + fetch)
    setCurrentPage(targetPage);

    // Wait a short delay for fetchData to complete
    setTimeout(() => {
      const startIndex = (targetPage - 1) * itemsPerPage;
      const targetIndex = sno - startIndex - 1;

      // Highlight the searched row
      const row = document.querySelectorAll("table tbody tr")[targetIndex];
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.classList.add("highlight-row");
        setTimeout(() => row.classList.remove("highlight-row"), 2500);
      }
    }, 800);

    return;
  }

  // 🔹 Otherwise, normal backend search (name/id)
  await fetchData(searchQuery);
};


  useEffect(() => {
    if (location.state?.successMsg) {
      setSuccessMsg(location.state.successMsg);
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [currentPage, startDate, endDate, searchQuery]);

  const deleteApplicant = async (id) => {
    if (!window.confirm("Delete this applicant?")) return;

    try {
      await axios.delete(`${API_URL}/api/connection/${id}/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        }
      });

      fetchData();
      alert("Applicant deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete applicant");
    }
  };

  const fetchData = async (query = "") => {
  if (!query && !startDate && !endDate) setLoading(true);

  try {
    let url = `${API_URL}/api/getApplicantsData/?page=${currentPage}`;
    if (startDate && endDate)
      url += `&start_date=${startDate.toISOString().split("T")[0]}&end_date=${endDate.toISOString().split("T")[0]}`;
    if (query)
      url += `&search=${query}`;

    const token = localStorage.getItem("token");
    const response = await fetch(url, {
      headers: {
        Authorization: token ? `Token ${token}` : undefined,
      },
    });

    if (!response.ok) throw new Error(`Server error ${response.status}`);
    const jsonData = await response.json();

    // ✅ Add S.No locally (for later S.No search)
    const withSno = (jsonData.data || []).map((item, index) => ({
      ...item,
      sno: (currentPage - 1) * 10 + index + 1,
    }));

    setData(withSno);
    setTotalPages(jsonData.total_pages || 1);
    setCurrentPage(jsonData.current_page || 1);
    setTotalItems(jsonData.total_items || 0);
    setErrorMsg("");

    if (withSno.length === 0 && query) setErrorMsg("⚠️ No applicants found for your search.");
  } catch (error) {
    console.error("Failed to fetch API:", error);
    setErrorMsg("⚠️ Failed to load data. Please try again later.");
  } finally {
    setLoading(false);
  }
};


  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pageNumbers.push(i);

    return (
      <div className="d-flex justify-content-center align-items-center mt-4 flex-wrap">
        <Button variant="outline-secondary" className="mx-1" disabled={currentPage === 1} onClick={() => handlePageChange(1)}>⏮ First</Button>
        <Button variant="outline-secondary" className="mx-1" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>← Prev</Button>

        {pageNumbers.map((num) => (
          <Button key={num} variant={num === currentPage ? "primary" : "outline-secondary"} className="mx-1" onClick={() => handlePageChange(num)}>{num}</Button>
        ))}

        <Button variant="outline-secondary" className="mx-1" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>Next →</Button>
        <Button variant="outline-secondary" className="mx-1" disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>Last ⏭</Button>
      </div>
    );
  };

  return (
    <div className="container mt-3">
      <h3>Applicants Details</h3>
      <hr />

      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" /> <p>Loading data...</p>
        </div>
      )}

      {!loading && (
        <>
          <Row className="mb-3 align-items-end">
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
                className="form-control"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by applicant ID or name"
              />
            </Col>
          </Row>

          <div className="table-container">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>DB ID</th>
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
                {data.length > 0 ? (
                  data.map((connection, index) => (
                    <tr key={connection.id}>
                      {/* ✅ Serial number */}
                      <td>{(currentPage - 1) * 10 + index + 1}</td>

                      {/* ✅ True database ID */}
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

                      <td className="text-center d-flex gap-2">
                        <Link className="btn btn-outline-primary btn-sm" to={`/EditApplicant/${connection.id}`}>
                          Edit
                        </Link>

                        <button className="btn btn-danger btn-sm" onClick={() => deleteApplicant(connection.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="17" className="text-center text-muted">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
}

export default Home;
