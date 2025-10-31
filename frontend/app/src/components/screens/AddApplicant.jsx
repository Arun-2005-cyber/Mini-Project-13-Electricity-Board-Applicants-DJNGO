import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

function EditApplicant() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { id } = useParams();

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

  // ✅ Fetch existing data for that applicant
  const getApplicant = async () => {
    const res = await axios.get(`${API_URL}/api/applicants/${id}/`, {
      headers: { Authorization: `Token ${token}` },
    });
    setForm(res.data);
  };

  useEffect(() => {
    getApplicant();
  }, []);

  const updateApplicant = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API_URL}/api/applicants/${id}/`, form, {
        headers: { Authorization: `Token ${token}` },
      });

      alert("✅ Applicant updated successfully");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.detail || "Update failed");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Edit Applicant</h3>
      <form onSubmit={updateApplicant} className="mt-3">

        <input className="form-control mb-2" name="Applicant_Name" placeholder="Name"
          value={form.Applicant_Name} onChange={handleChange} />

        <select className="form-control mb-2" name="Gender"
          value={form.Gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <select className="form-control mb-2" name="State"
          value={form.State} onChange={handleChange}>
          <option value="">Select State</option>
          {Object.keys(stateDistricts).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select className="form-control mb-2" name="District"
          value={form.District} onChange={handleChange}>
          <option value="">Select District</option>
          {form.State && stateDistricts[form.State]?.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <input className="form-control mb-2" name="Pincode" placeholder="Pincode"
          value={form.Pincode} onChange={handleChange} />

        <select className="form-control mb-2" name="Ownership"
          value={form.Ownership} onChange={handleChange}>
          <option value="">Select Ownership</option>
          {ownershipOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>

        <select className="form-control mb-2" name="GovtID_Type"
          value={form.GovtID_Type} onChange={handleChange}>
          <option value="">Select Govt ID Type</option>
          {idTypes.map((id) => (
            <option key={id} value={id}>{id}</option>
          ))}
        </select>

        <input className="form-control mb-2" name="ID_Number" placeholder="ID Number"
          value={form.ID_Number} onChange={handleChange} />

        <select className="form-control mb-3" name="Category"
          value={form.Category} onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button className="btn btn-success w-100">Update Applicant</button>
      </form>
    </div>
  );
}

export default EditApplicant;
