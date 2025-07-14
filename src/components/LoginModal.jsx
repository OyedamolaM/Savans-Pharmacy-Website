// src/components/LoginModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './LoginModal.scss';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../firebase';

function LoginModal({ onClose, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose(); // Firebase auth listener will handle the rest
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email above to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert('📩 Password reset email sent!');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Error sending reset email. Try again.');
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-msg">{error}</p>}

          <div className="button-row">
            <button type="submit">Login</button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>

          <div className="extra-actions">
            <a href="#" onClick={(e) => {
              e.preventDefault();
              handleForgotPassword();
            }}>
              Forgot password?
            </a>
            <br />
            <a href="#" onClick={(e) => {
              e.preventDefault();
              onSwitchToSignup?.();
            }}>
              Don’t have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default LoginModal;
