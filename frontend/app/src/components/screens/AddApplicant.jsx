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
    district: "",
    state: "",
    pincode: "",
    ownership: "",
    govtID_type: "",
    id_number: "",
    category: "",
    load_applied: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/api/applicants/`,
        form,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      navigate("/", {
        state: { successMsg: "✅ Applicant added successfully" },
      });

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || "Failed to add applicant");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Add New Applicant</h3>
      <form onSubmit={submitForm} className="mt-3">

        {Object.keys(form).map((key) => (
          <div className="mb-2" key={key}>
            <label className="form-label">
              {key.replace("_", " ").toUpperCase()}
            </label>

            <input
              className="form-control"
              name={key}
              value={form[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <button className="btn btn-primary w-100">
          Add Applicant
        </button>

      </form>
    </div>
  );
}

export default AddApplicant;
