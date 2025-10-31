import React, { useState, useEffect } from "react";
import { Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";

function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgVariant, setMsgVariant] = useState("info");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if logged in
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  // Clear message automatically
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setMsgVariant("danger");
      setMsg("⚠️ Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/login/`, { username, password });

      // Adjust according to Django API
      const token = res.data?.token || res.data?.access || null;
      const userData = res.data?.user ?? null;

      if (token && userData) {
        login(userData, token);
        setMsgVariant("success");
        setMsg("✅ Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 1000);
      } else {
        setMsgVariant("danger");
        setMsg("❌ Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMsgVariant("danger");
      setMsg("❌ " + (err.response?.data?.detail || "Server connection failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row mt-5" style={{ padding: "20px" }}>
      <div className="col-3"></div>
      <div className="col-6 card p-4 shadow-lg rounded-4">
        <h2 className="text-center mb-3">Login</h2>

        {msg && <Alert variant={msgVariant} className="text-center py-2">{msg}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button className="mt-3 w-100" type="submit" disabled={loading}>
            {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Logging in...</> : "Login"}
          </Button>
        </Form>

        <div className="text-center mt-3">
          Don’t have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
      <div className="col-3"></div>
    </div>
  );
}

export default LoginScreen;
