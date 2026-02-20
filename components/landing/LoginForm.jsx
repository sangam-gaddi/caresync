"use client";
import "./LoginForm.css";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      if (data.redirect) {
        router.push(data.redirect);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-form-section">
      <div className="contact-parallax-image-wrapper">
        <h1>CareSync</h1>
        <img src="/contact-form/contact-parallax.png" alt="" />
      </div>
      <form className="login-form-container" onSubmit={handleLogin}>
        <div className="cf-header">
          <h4>Access your health dashboard.</h4>
        </div>
        <div className="cf-copy">
          <p className="bodyCopy sm">
            Sign in to your CareSync account for AI-powered health insights.
          </p>
        </div>
        <div className="cf-input">
          <input
            type="email"
            placeholder="Enter Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="login-error">{error}</p>}
        <button
          type="submit"
          className="cf-submit-btn"
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
        <div className="cf-footer">
          <div className="cf-divider"></div>
          <div className="cf-footer-copy">
            <p className="bodyCopy sm">
              No account? Sign up from the button below.
            </p>
          </div>
        </div>
      </form>
    </section>
  );
};

export default LoginForm;
