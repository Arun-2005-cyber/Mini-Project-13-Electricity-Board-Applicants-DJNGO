import React, { useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import Loader from "../Loader";
import Message from "../Message";

function AddApplicant() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    Applicant_Name: "",
    Gender: "",
    State: "",
    District: "",
    Pincode: "",
    Ownership: "",
    GovtID_Type: "",
    ID_Number: "",
    Category: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const stateDistricts = {
    Telangana: ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad"],
    "Andhra Pradesh": ["Vijayawada", "Visakhapatnam", "Guntur", "Tirupati"],
    Karnataka: ["Bengaluru", "Mysuru", "Hubli"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  };

  const ownershipOptions = ["INDIVIDUAL", "JOINT"];
  const idTypes = ["AADHAR", "VOTER_ID", "PAN", "PASSPORT"];
  const categories = ["Residential", "Commercial"];

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "Pincode") value = value.replace(/\D/g, "").slice(0, 6);
    setForm({ ...form, [name]: value });
  };

  const submitApplicant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await axios.post(`${API_URL}/api/applicant/create/`, form, {
        headers: { Authorization: `Token ${token}` },
      });

      setSuccessMsg("✅ Applicant added successfully!");

      setTimeout(() => navigate("/profile"), 800);
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || "❌ Failed to add applicant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "500px" }}>
      <h3 className="mb-3">Add Applicant</h3>

      {successMsg && <Message variant="success">{successMsg}</Message>}
      {errorMsg && <Message variant="danger">{errorMsg}</Message>}
      {loading && <Loader text="Saving applicant..." />}

      {!loading && (
        <form onSubmit={submitApplicant} className="mt-3">
          <input className="form-control mb-2" name="Applicant_Name" placeholder="Name"
            value={form.Applicant_Name} onChange={handleChange} required />

          <select className="form-control mb-2" name="Gender" 
            value={form.Gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select className="form-control mb-2" name="State"
            value={form.State} onChange={handleChange} required>
            <option value="">Select State</option>
            {Object.keys(stateDistricts).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select className="form-control mb-2" name="District"
            value={form.District} onChange={handleChange} required>
            <option value="">Select District</option>
            {form.State && stateDistricts[form.State]?.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <input className="form-control mb-2" name="Pincode" placeholder="Pincode"
            value={form.Pincode} onChange={handleChange} required />

          <select className="form-control mb-2" name="Ownership"
            value={form.Ownership} onChange={handleChange} required>
            <option value="">Select Ownership</option>
            {ownershipOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <select className="form-control mb-2" name="GovtID_Type"
            value={form.GovtID_Type} onChange={handleChange} required>
            <option value="">Select Govt ID Type</option>
            {idTypes.map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>

          <input className="form-control mb-2" name="ID_Number" placeholder="ID Number"
            value={form.ID_Number} onChange={handleChange} required />

          <select className="form-control mb-3" name="Category"
            value={form.Category} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button className="btn btn-primary w-100">Add Applicant</button>
        </form>
      )}
    </div>
  );
}

export default AddApplicant;
