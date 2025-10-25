import { useState, useEffect } from 'react';
import React from 'react';
import { Row, Col, Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API_URL from "../../config";

function EditApplicant() {
  const { id } = useParams();

  const [applicantdata, setApplicantData] = useState({
    Applicant_Name: "",
    Gender: "",
    District: "",
    State: "",
    Pincode: "",
    Ownership: "",
    GovtID_Type: "",
    ID_Number: "",
    Category: ""
  });

  const [connectiondata, setConnectionData] = useState({
    Load_Applied: "",
    Date_of_Application: "",
    Date_of_Approval: "",
    Modified_Date: "",
    Status: "",
    Reviewer_ID: "",
    Reviewer_Name: "",
    Reviewer_Comments: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loader state

  const fetchApplicantData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/update_applicant/${id}/`);
      const data = await response.json();
      setApplicantData(data.applicant);
      setConnectionData(data.connection);
    } catch (error) {
      console.error("Error fetching applicant data:", error);
      setMessage("❌ Failed to load applicant data.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (applicantdata.hasOwnProperty(name)) {
      setApplicantData({ ...applicantdata, [name]: value });
    }
    if (connectiondata.hasOwnProperty(name)) {
      setConnectionData({ ...connectiondata, [name]: value });
    }
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (connectiondata.Load_Applied > 200) {
        setMessage("⚠️ Load Applied cannot be greater than 200");
        setMessageType("error");
        setTimeout(() => setMessage(""), 3000);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/update_applicant/${id}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicant: applicantdata,
          connection: connectiondata
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("✅ Applicant Updated Successfully.");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          navigate("/");
        }, 1500);
      } else {
        setMessage(result.error || "❌ Failed to update applicant.");
        setMessageType("error");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error updating applicant data", error);
      setMessage("❌ Error while updating. Try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="row">
        <div className="col-md-3">
          <Link to="/" className='btn btn-dark my-1'>
            Go Back
          </Link>
        </div>
      </div>
      <hr />
      <h3>Edit Applicants or Connection Details</h3>
      <hr />

      {loading && (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Processing...</p>
        </div>
      )}

      {message && (
        <Alert
          variant={messageType === "success" ? "success" : "danger"}
          className="text-center"
        >
          {message}
        </Alert>
      )}

      {!loading && (
        <Form onSubmit={handleSubmit}>
          <Row>
            {/* -------- Left Column -------- */}
            <Col md={6}>
              <Form.Group controlId='Applicant_Name'>
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type='text'
                  name='Applicant_Name'
                  value={applicantdata.Applicant_Name || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Gender' className='mt-3'>
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  name='Gender'
                  value={applicantdata.Gender || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">--Select--</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId='District' className='mt-3'>
                <Form.Label>District</Form.Label>
                <Form.Control
                  type='text'
                  name='District'
                  value={applicantdata.District || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='State' className='mt-3'>
                <Form.Label>State</Form.Label>
                <Form.Control
                  type='text'
                  name='State'
                  value={applicantdata.State || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Pincode' className='mt-3'>
                <Form.Label>Pincode</Form.Label>
                <Form.Control
                  type='number'
                  name='Pincode'
                  value={applicantdata.Pincode || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Ownership' className='mt-3'>
                <Form.Label>Ownership</Form.Label>
                <Form.Select
                  name='Ownership'
                  value={applicantdata.Ownership || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">--Select--</option>
                  <option value="INDIVIDUAL">INDIVIDUAL</option>
                  <option value="JOINT">JOINT</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId='GovtID_Type' className='mt-3'>
                <Form.Label>GovtID_Type</Form.Label>
                <Form.Select
                  name='GovtID_Type'
                  value={applicantdata.GovtID_Type || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">--Select--</option>
                  <option value="AADHAR">AADHAR</option>
                  <option value="VOTER_ID">VOTER_ID</option>
                  <option value="PAN">PAN</option>
                  <option value="PASSPORT">PASSPORT</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId='ID_Number' className='mt-3'>
                <Form.Label>ID_Number</Form.Label>
                <Form.Control
                  type='text'
                  name='ID_Number'
                  value={applicantdata.ID_Number || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Category' className='mt-3'>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name='Category'
                  value={applicantdata.Category || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">--Select--</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* -------- Right Column -------- */}
            <Col md={6}>
              <Form.Group controlId='Load_Applied'>
                <Form.Label>Load_Applied</Form.Label>
                <Form.Control
                  type='number'
                  name='Load_Applied'
                  value={connectiondata.Load_Applied || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Date_of_Application' className='mt-3'>
                <Form.Label>Date_of_Application</Form.Label>
                <Form.Control
                  type='date'
                  name='Date_of_Application'
                  value={connectiondata.Date_of_Application || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Date_of_Approval' className='mt-3'>
                <Form.Label>Date_of_Approval</Form.Label>
                <Form.Control
                  type='date'
                  name='Date_of_Approval'
                  value={connectiondata.Date_of_Approval || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Modified_Date' className='mt-3'>
                <Form.Label>Modified_Date</Form.Label>
                <Form.Control
                  type='date'
                  name='Modified_Date'
                  value={connectiondata.Modified_Date || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Status' className='mt-3'>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name='Status'
                  value={connectiondata.Status || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">--Select--</option>
                  <option value="Connection Released">Connection Released</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </Form.Select>
              </Form.Group>

              <Form.Group controlId='Reviewer_ID' className='mt-3'>
                <Form.Label>Reviewer_ID</Form.Label>
                <Form.Control
                  type='number'
                  name='Reviewer_ID'
                  value={connectiondata.Reviewer_ID || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Reviewer_Name' className='mt-3'>
                <Form.Label>Reviewer_Name</Form.Label>
                <Form.Control
                  type='text'
                  name='Reviewer_Name'
                  value={connectiondata.Reviewer_Name || ""}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId='Reviewer_Comments' className='mt-3'>
                <Form.Label>Reviewer_Comments</Form.Label>
                <Form.Select
                  name='Reviewer_Comments'
                  value={connectiondata.Reviewer_Comments || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">--Select--</option>
                  <option value="Installation pending">Installation pending</option>
                  <option value="Documents Verification in progress">Documents Verification in progress</option>
                  <option value="Installation completed">Installation completed</option>
                  <option value="KYC failed">KYC failed</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Button variant='primary' className='mt-3 text-center' type='submit'>
            UPDATE
          </Button>
          <br /><br /><br />
        </Form>
      )}
    </Container>
  );
}

export default EditApplicant;
