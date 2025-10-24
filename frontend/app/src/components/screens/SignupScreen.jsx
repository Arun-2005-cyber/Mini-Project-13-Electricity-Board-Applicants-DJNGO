import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate } from "react-router-dom";

function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMsg("❌ Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/signup/`, {
        username,
        email,
        password,
      });

      if (res.data.status === "success") {
        setMsg("✅ Account created successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg("❌ " + (res.data.message || "Signup failed."));
      }
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div style={{ padding: "20px" }} className="row mt-5">
      <div className="col-3"></div>
      <div className="col-6 card p-4">
        <h2 className="text-center">Signup</h2>
        <Form onSubmit={handleSignup}>
          <Form.Group>
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button className="mt-4 w-100" type="submit">
            Signup
          </Button>
        </Form>
        <br />
        {msg && <p className="text-center">{msg}</p>}
      </div>
      <div className="col-3"></div>
    </div>
  );
}

export default SignupScreen;
