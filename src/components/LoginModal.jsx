// src/components/LoginModal.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './LoginModal.scss';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

function LoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose(); // Firebase will handle updating auth state
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
  if (!email) {
    setError('Enter your email above to reset your password');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert('Password reset email sent!');
    setError('');
  } catch (err) {
    console.error(err);
    setError('Error sending reset email. Please try again.');
  }
};

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Login Required</h2>
        <form onSubmit={handleSubmit}>
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
          <button type="submit">Login</button>
        <div className='button-row'>
        <div className="forgot-link">
            <a href="#" onClick={(e) => {
                e.preventDefault();
                handleForgotPassword();
            }}>
                Forgot password?
            </a>
        </div>
            <button className="cancel-btn" onClick={onClose}>
                Cancel
            </button>
            </div>
       </form>
        

        
      </div>
    </div>,
    document.body
  );
}

export default LoginModal;
