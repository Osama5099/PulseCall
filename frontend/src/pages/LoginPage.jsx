import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveUser } from "../utils/auth";

/**
 * Login page: name + email only. Stores identity in React state and localStorage.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function onSubmit(event) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    saveUser({ name, email });
    navigate("/room");
  }

  return (
    <div className="page-center">
      <div className="card login-card">
        
        <h1>PulseCall</h1>
        <p className="muted">
          Join a mesh WebRTC room with Spring Boot signaling. No password — just a name and email.
        </p>
        <form onSubmit={onSubmit} className="form">
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Osama"
              autoComplete="name"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="osama@gmail.com"
              autoComplete="email"
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" className="btn primary">
            Continue to rooms
          </button>
        </form>
      </div>
    </div>
  );
}
