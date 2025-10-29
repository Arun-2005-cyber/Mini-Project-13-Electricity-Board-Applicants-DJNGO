import React, { useState, useEffect } from "react";
import { Form, Button, InputGroup, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";  // ✅ Import auth context

function SignupScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgVariant, setMsgVariant] = useState("info");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();  // ✅ from context

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  const validateForm = () => {
    if (!username.trim() || !email.trim()) return false;
    if (password.length < 6) return false;
    if (password !== confirmPassword) return false;
    if (!agree) return false;
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMsgVariant("danger");
      setMsg("⚠️ Please fill all fields correctly.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Step 1: Register the user
      const res = await axios.post(`${API_URL}/api/signup/`, {
        username,
        email,
        password,
      });

      if (res.data.status === "success") {
        // ✅ Step 2: Auto-login right after successful signup
        const loginRes = await axios.post(`${API_URL}/api/login/`, {
          username,
          password,
        });

        // ✅ Step 3: Save token + user in Auth Context
        login(loginRes.data.token, { username });

        // ✅ Step 4: Show success and redirect
        setMsgVariant("success");
        setMsg("✅ Account created! Logging you in...");
        setTimeout(() => navigate("/", { replace: true }), 1500);
      } else {
        setMsgVariant("danger");
        setMsg("❌ " + (res.data.message || "Signup failed."));
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMsgVariant("danger");
      setMsg("❌ " + (err.response?.data?.message || "Server error."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row mt-5" style={{ padding: "20px" }}>
      <div className="col-3"></div>
      <div className="col-6 card p-4 shadow-lg rounded-4">
        <h2 className="text-center mb-3">Create Account</h2>

        {msg && (
          <Alert variant={msgVariant} className="text-center py-2">
            {msg}
          </Alert>
        )}

        <Form onSubmit={handleSignup}>
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
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 chars)"
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

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowConfirm(!showConfirm)}
                type="button"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label={
                <>
                  I agree to the{" "}
                  <Link to="#" style={{ color: "#007bff" }}>
                    Terms & Conditions
                  </Link>
                </>
              }
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
          </Form.Group>

          <Button
            className="mt-2 w-100"
            type="submit"
            disabled={!validateForm() || loading}
            variant="primary"
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Signing up...
              </>
            ) : (
              "Signup"
            )}
          </Button>
        </Form>

        <div className="text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#007bff" }}>
            Login here
          </Link>
        </div>
      </div>
      <div className="col-3"></div>
    </div>
  );
}

export default SignupScreen;
