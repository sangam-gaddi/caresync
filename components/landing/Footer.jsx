"use client";
import "./Footer.css";
import Link from "next/link";

import LoginForm from "./LoginForm";

const Footer = () => {
  return (
    <>
      <LoginForm />

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-row">
            <div className="footer-col">
              <div className="footer-col-header">
                <p className="bodyCopy">Root</p>
              </div>
              <div className="footer-col-links">
                <Link href="/">Index</Link>
                <Link href="/os">A.I Specialists</Link>
                <Link href="#dataset">Dataset Trained</Link>
                <Link href="/onboarding">Get Started</Link>
              </div>
            </div>
            <div className="footer-col">
              <div className="footer-col-header">
                <p className="bodyCopy">Connect Feed</p>
              </div>
              <div className="footer-col-links">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </a>
              </div>
            </div>
            <div className="footer-col">
              <div className="footer-col-header">
                <p className="bodyCopy">Open Line</p>
              </div>
              <div className="footer-col-links">
                <p>AI Health Platform</p>
                <p>Cloud Infrastructure</p>
                <p>System 001, CareSync</p>
              </div>
            </div>
          </div>
          <div className="footer-row">
            <div className="footer-copyright">
              <h5>CareSync</h5>
              <p className="bodyCopy">&copy;2025 All modules reserved.</p>
              <p className="bodyCopy" id="copyright-text">
                Built by CareSync AI
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
