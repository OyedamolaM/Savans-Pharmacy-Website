import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h3>Savans Pharmacy</h3>
          <p>
            Your trusted partner for prescriptions, wellness essentials, and
            personalized care.
          </p>
          <div className="footer-badges">
            <span>Licensed Pharmacy</span>
            <span>Secure Payments</span>
            <span>Fast Delivery</span>
          </div>
        </div>

        <div className="footer-links">
          <h4>Shop</h4>
          <ul>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/consultations">Consultations</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/dashboard">My Account</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Get in touch</h4>
          <p>24/7 pharmacist support</p>
          <div className="footer-contact-row">
            <div className="footer-contact-links">
              <a href="tel:+2348101490829" title="+2348101490829">Call</a>
              <a
                href="https://wa.me/2348101490829"
                target="_blank"
                rel="noreferrer"
                title="+2348101490829"
              >
                WhatsApp
              </a>
              <a href="mailto:savanspharmacy@gmail.com" title="savanspharmacy@gmail.com">
                Email
              </a>
              <a href="tel:07082185745" className="secondary-phone" title="07082185745">
                Call 2
              </a>
            </div>
            <div className="footer-hours">
              <span>Mon - Sat: 8am - 9pm</span>
              <span>Sun: 1pm - 9pm</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Savans Pharmacy. All rights reserved.</p>
        <div className="footer-socials">
          <a
            href="https://www.instagram.com/savans_healthcare"
            aria-label="Instagram"
            target="_blank"
            rel="noreferrer"
            className="social-link instagram"
          >
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5zm4.8-3.1a1.1 1.1 0 1 1 0 2.2a1.1 1.1 0 0 1 0-2.2z" />
              </svg>
            </span>
            <span className="social-text">Instagram</span>
          </a>
          <a
            href="https://x.com/savanspharmacy"
            aria-label="X"
            target="_blank"
            rel="noreferrer"
            className="social-link x"
          >
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path d="M17.4 3H21l-7.9 9.1L22 21h-6.6l-4.8-5.7L5.1 21H1.5l8.4-9.6L2 3h6.7l4.4 5.2L17.4 3zm-1.1 15.4h1.8L7.7 5.5H5.8l10.5 12.9z" />
              </svg>
            </span>
            <span className="social-text">X</span>
          </a>
          <a
            href="https://web.facebook.com/savanspharmacyandstores"
            aria-label="Facebook"
            target="_blank"
            rel="noreferrer"
            className="social-link facebook"
          >
            <span className="social-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img" focusable="false">
                <path d="M13.5 9.2V7.6c0-.8.5-1 1-1h1.7V3.1l-2.3-.1c-2.5 0-4.1 1.5-4.1 4v2.2H7.6v3.4h2.2V21h3.7v-8.4h2.4l.4-3.4h-2.8z" />
              </svg>
            </span>
            <span className="social-text">Facebook</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
