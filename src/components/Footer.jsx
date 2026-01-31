import React from "react";
import { Link } from "react-router-dom";
import "./Footer.scss";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-newsletter">
        <h2>Subscribe &amp; Save 15%</h2>
        <p>
          Get your favorite supplements delivered automatically and enjoy exclusive discounts
        </p>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button type="button">Subscribe</button>
        </div>
      </div>

      <div className="footer-top">
        <div className="footer-brand">
          <h3>supplements.ng</h3>
          <p>Premium quality supplements for your health and wellness journey.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">fb</a>
            <a href="#" aria-label="Instagram">ig</a>
            <a href="#" aria-label="X">x</a>
            <a href="#" aria-label="YouTube">yt</a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Products</h4>
          <ul>
            <li><Link to="/products">Protein &amp; Fitness</Link></li>
            <li><Link to="/products">Vitamins</Link></li>
            <li><Link to="/products">Supplements</Link></li>
            <li><Link to="/products">Best Sellers</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/about">Our Story</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/shipping">Shipping</Link></li>
            <li><Link to="/returns">Returns</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 supplements.ng. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
