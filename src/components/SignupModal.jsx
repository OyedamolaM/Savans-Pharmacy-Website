// src/components/SignupModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './LoginModal.scss'; // ✅ Reusing same styles
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function SignupModal({ onClose, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('✅ Account created!');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Signup failed');
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create Account</h2>
        <form onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-msg">{error}</p>}

          <div className="button-row">
            <button type="submit">Sign Up</button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>

          <div className="extra-actions">
            <p>
              Already have an account?{' '}
              <a href="#" onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin?.();
              }}>
                Log in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default SignupModal;
