import { useState, useEffect } from 'react'
import React from 'react'
import { Row, Col, Container, Form, Button } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useNavigate } from "react-router-dom";

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
    })
    const [message, setMessage] = useState("")
    const [messageType, setMessageType] = useState("");




    const fetchApplicantData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/update_applicant/${id}/`);
            const data = await response.json();
            console.log("Fetched Data:", data);
            setApplicantData(data.applicant);
            setConnectionData(data.connection);

        } catch (error) {
            console.error("Error fetching applicant data:", error);
        }
    };


    useEffect(() => {
        fetchApplicantData()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApplicantData({ ...applicantdata, [name]: value });
        setConnectionData({ ...connectiondata, [e.target.name]: e.target.value, })
    }

 const navigate = useNavigate(); // initialize navigation

     const handleSubmit = async (e) => {
        e.preventDefault(); // ✅ Corrected spelling

        try {
            if (connectiondata.Load_Applied > 200) {
                setMessage("Load Applied cannot be greater than 200");
                setMessageType("error");
                setTimeout(() => {
                    setMessage("");
                    setMessageType("");
                }, 2000);
                return;
            }

            const response = await fetch(`http://localhost:8000/api/update_applicant/${id}/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    applicant: applicantdata,
                    connection: connectiondata
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage("Applicant Updated Successfully.");
                setMessageType("success");

                setTimeout(() => {
                    navigate("/");
                }, 1500);
            } else {
                setMessage(result.error || "Failed to update applicant.");
                setMessageType("error");
            }

        } catch (error) {
            console.error("Error updating applicant data", error);
            setMessage("Error while updating. Try again.");
            setMessageType("error");
        }
    };



    return (
        <>
              
            <Container>
                <div className="row">
                    <div className="col-md-3">
                        {""}
                        <Link to="/" className='btn btn-dark my-1'>
                            Go Back
                        </Link>
                    </div>
                </div>
                <hr />
                <h3>Edit Applicants or Connection Details</h3>
                <hr />
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId='Applicant_Name'>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type='text'
                                    name='Applicant_Name'
                                    value={applicantdata.Applicant_Name || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId='Gender' className='mt-3'>
                                <Form.Label>Gender</Form.Label>
                                <Form.Control
                                    as="select"
                                    name='Gender'
                                    value={applicantdata.Gender || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='District' className='mt-3'>
                                <Form.Label>District</Form.Label>
                                <Form.Control
                                    type='text'
                                    name='District'
                                    value={applicantdata.District || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='State' className='mt-3'>
                                <Form.Label>State</Form.Label>
                                <Form.Control
                                    type='text'
                                    name='State'
                                    value={applicantdata.State || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='Pincode' className='mt-3'>
                                <Form.Label>Pincode</Form.Label>
                                <Form.Control
                                    type='number'
                                    name='Pincode'
                                    value={applicantdata.Pincode || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='Ownership' className='mt-3'>
                                <Form.Label>Ownership</Form.Label>
                                <Form.Control
                                    as="select"
                                    name='Ownership'
                                    value={applicantdata.Ownership || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="INDIVIDUAL">INDIVIDUAL</option>
                                    <option value="JOINT">JOINT</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='GovtID_Type' className='mt-3'>
                                <Form.Label>GovtID_Type</Form.Label>
                                <Form.Control
                                    as="select"
                                    name='GovtID_Type'
                                    value={applicantdata.GovtID_Type || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="AADHAR">AADHAR</option>
                                    <option value="VOTER_ID">VOTER_ID</option>
                                    <option value="PAN">PAN</option>
                                    <option value="PASSPORT">PASSPORT</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='ID_Number' className='mt-3'>
                                <Form.Label>ID_Number</Form.Label>
                                <Form.Control
                                    type='text'
                                    name='ID_Number'
                                    value={applicantdata.ID_Number || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='Category' className='mt-3'>
                                <Form.Label>Category</Form.Label>
                                <Form.Control
                                    as="select"
                                    name='Category'
                                    value={applicantdata.Category || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId='Load_Applied'>
                                <Form.Label>Load_Applied</Form.Label>
                                <Form.Control
                                    type='number'
                                    name='Load_Applied'
                                    value={connectiondata.Load_Applied || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='Date_of_Application' className='mt-3'>
                                <Form.Label>Date_of_Application</Form.Label>
                                <Form.Control
                                    type='text'
                                    name='Date_of_Application'
                                    value={connectiondata.Date_of_Application || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='Date_of_Approval' className='mt-3'>
                                <Form.Label>Date_of_Approval</Form.Label>
                                <Form.Control
                                    type='text'
                                    name='Date_of_Approval'
                                    value={connectiondata.Date_of_Approval || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='Modified_Date' className='mt-3'>
                                <Form.Label>Modified_Date</Form.Label>
                                <Form.Control
                                    type='text'
                                    name='Modified_Date'
                                    value={connectiondata.Modified_Date || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='Status' className='mt-3'>
                                <Form.Label>Status</Form.Label>
                                <Form.Control
                                    as="select"
                                    name='Status'
                                    value={connectiondata.Status || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Connection Released">Connection Released</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='Reviewer_ID' className='mt-3'>
                                <Form.Label>Reviewer_ID</Form.Label>
                                <Form.Control
                                    type='number'
                                    name='Reviewer_ID'
                                    value={connectiondata.Reviewer_ID || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>


                            <Form.Group controlId='Reviewer_Name' className='mt-3'>
                                <Form.Label>Reviewer_Name</Form.Label>
                                <Form.Control
                                    type='text'
                                    name='Reviewer_Name'
                                    value={connectiondata.Reviewer_Name || ""}
                                    onChange={handleChange}
                                    required
                                >
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='Reviewer_Comments' className='mt-3'>
                                <Form.Label>Reviewer_Comments</Form.Label>
                                <Form.Control
                                    as="select"
                                    name='Reviewer_Comments'
                                    value={connectiondata.Reviewer_Comments || ""}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Installation pending">Installation pending</option>
                                    <option value="Documents Verification in progress">Documents Verification in progress</option>
                                    <option value="Installation completed">Installation completed</option>
                                    <option value="KYC failed">KYC failed</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
<br />
{message && <p style={{ color: "red" }}>{message}</p>}
                    <Button variant='primary' className='mt-3 text-center' type='submit'>
                        UPDATE
                    </Button>
                    <br />
                    <br />
                    <br />
                </Form>
            </Container>
        </>
    )
}

export default EditApplicant