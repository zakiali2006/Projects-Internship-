import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
    // Simple client-side validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Call backend login
    (async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });

        if (res.ok) {
          const user = await res.json();
          localStorage.setItem('user', JSON.stringify(user));
          navigate('/page');
        } else {
          const data = await res.json();
          setError(data.message || 'Invalid email or password');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Error during login');
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1>Login</h1>
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
            />
          </div>
          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <div className="navigation-buttons">
            <p className="signup-link">
              Don't have an account? <span className="signup-text" onClick={() => navigate('/register')}>Sign up</span>
            </p>
            <button
              type="button"
              className="nav-button guest-button"
              onClick={() => {
                // Set a flag in localStorage to indicate guest mode
                localStorage.setItem('isGuest', 'true');
                navigate('/page');
              }}
            >
              Continue as Guest
            </button>
          </div>
          <p className="signup-link">
            Or type in the address bar: /register or /page
          </p>
        </form>
      </div>
    </div>
  );
}
