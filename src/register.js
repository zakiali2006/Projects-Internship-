import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Call backend API
    (async () => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (res.status === 201) {
          alert('Registration successful! Please login.');
          navigate('/');
        } else {
          const data = await res.json();
          setError(data.message || 'Registration failed');
        }
      } catch (err) {
        console.error('Registration error:', err);
        setError('Error during registration');
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1>Register</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div style={{
              color: "#ff4444",
              textAlign: "center",
              marginBottom: "1rem",
              fontSize: "0.875rem"
            }}>
              {error}
            </div>
          )}
          <div className="input-container">
            <input
              placeholder="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-container">
            <input
              placeholder="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-container">
            <input
              placeholder="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
          <p className="signup-link">
            Already have an account?{' '}
            <span className="signup-text" onClick={() => navigate('/')}>
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

