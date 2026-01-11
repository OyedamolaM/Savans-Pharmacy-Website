import React, { useState } from 'react';
import { registerUser } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './Auth.scss';

const Register = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await registerUser({ name, phone, email, password });
      alert(data.message || 'Registration successful! You can now log in.');
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      navigate('/login'); // redirect to login after successful registration
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create account</h2>
        <p>Join Savans Pharmacy for faster checkout and easy reorders.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Name
            <input
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Phone
            <input
              placeholder="Phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              placeholder="Create a password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-btn">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
