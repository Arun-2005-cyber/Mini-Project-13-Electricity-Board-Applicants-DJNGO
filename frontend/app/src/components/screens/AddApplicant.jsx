import React, { useState } from "react";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

function AddApplicant() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    state: "",
    district: "",
    pincode: "",
    ownership: "",
    govtID_type: "",
    id_number: "",
    category: "",
    load_applied: "",
    dob: "",
    application_date: "",
  });

  const [errors, setErrors] = useState({});

  const genders = ["Male", "Female", "Other"];

  const stateDistricts = {
    Telangana: ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad"],
    "Andhra Pradesh": ["Vijayawada", "Visakhapatnam", "Guntur", "Tirupati"],
    Karnataka: ["Bengaluru", "Mysuru", "Hubli"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  };

  const ownership = ["Owned", "Rented", "Government"];
  const idTypes = ["Aadhar", "PAN", "Passport", "Driving License"];
  const categories = ["Residential", "Commercial", "Industrial", "Agriculture"];

  const validate = () => {
    const temp = {};
    if (!form.name) temp.name = "Name is required";
    if (!form.email.includes("@")) temp.email = "Valid email required";
    if (form.pincode.length !== 6) temp.pincode = "Pincode must be 6 digits";
    if (!form.dob) temp.dob = "DOB required";
    if (!form.application_date) temp.application_date = "Application date required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "pincode") {
      value = value.replace(/\D/g, "").slice(0, 6); // only digits, max 6
    }

    if (name === "state") {
      setForm({ ...form, [name]: value, district: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await axios.post(`${API_URL}/api/applicants/`, form, {
        headers: { Authorization: `Token ${token}` },
      });

      navigate("/", { state: { successMsg: "✅ Applicant added successfully" } });
    } catch (error) {
      alert(error.response?.data?.detail || "Failed to add applicant");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Add New Applicant</h3>
      <form onSubmit={submitForm} className="mt-3">

        {/** NAME */}
        <input className="form-control mb-1" name="name" placeholder="Name"
          value={form.name} onChange={handleChange} />
        <small className="text-danger">{errors.name}</small>

        {/** EMAIL */}
        <input className="form-control mb-1" name="email" placeholder="Email"
          value={form.email} onChange={handleChange} />
        <small className="text-danger">{errors.email}</small>

        {/** GENDER */}
        <select className="form-control mb-1" name="gender"
          value={form.gender} onChange={handleChange}>
          <option value="">--Select Gender--</option>
          {genders.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        {/** STATE */}
        <select className="form-control mb-1" name="state"
          value={form.state} onChange={handleChange}>
          <option value="">--Select State--</option>
          {Object.keys(stateDistricts).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/** DISTRICT */}
        <select className="form-control mb-1" name="district"
          value={form.district} onChange={handleChange} disabled={!form.state}>
          <option value="">--Select District--</option>
          {form.state && stateDistricts[form.state].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/** PINCODE */}
        <input className="form-control mb-1" name="pincode" placeholder="Pincode"
          value={form.pincode} onChange={handleChange} />
        <small className="text-danger">{errors.pincode}</small>

        {/** DATES */}
        <label className="mt-2"><b>Date of Birth</b></label>
        <input type="date" className="form-control mb-1" name="dob"
          value={form.dob} onChange={handleChange} />
        <small className="text-danger">{errors.dob}</small>

        <label><b>Application Date</b></label>
        <input type="date" className="form-control mb-1" name="application_date"
          value={form.application_date} onChange={handleChange} />
        <small className="text-danger">{errors.application_date}</small>

        {/** DROPDOWNS */}
        <select className="form-control mb-1" name="ownership"
          value={form.ownership} onChange={handleChange}>
          <option value="">--Select Ownership--</option>
          {ownership.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>

        <select className="form-control mb-1" name="govtID_type"
          value={form.govtID_type} onChange={handleChange}>
          <option value="">--Select Govt ID Type--</option>
          {idTypes.map((id) => <option key={id} value={id}>{id}</option>)}
        </select>

        <input className="form-control mb-1" name="id_number" placeholder="ID Number"
          value={form.id_number} onChange={handleChange} />

        <select className="form-control mb-1" name="category"
          value={form.category} onChange={handleChange}>
          <option value="">--Select Category--</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <input className="form-control mb-2" name="load_applied" placeholder="Load Applied (KW)"
          value={form.load_applied} onChange={handleChange} />

        <button className="btn btn-primary w-100">Add Applicant</button>
      </form>
    </div>
  );
}

export default AddApplicant;
