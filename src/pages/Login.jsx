import React, { useState } from 'react';
import { loginUser } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './Auth.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      // Save token and role
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role); // "customer" or staff/admin
      localStorage.setItem('name', res.data.name);

      // Redirect based on role
      if (res.data.role === 'admin' || res.data.role === 'super_admin') {
        navigate('/admin');
      } else if (
        ['branch_manager', 'accountant', 'inventory_manager', 'cashier', 'staff'].includes(res.data.role)
      ) {
        navigate('/staff');
      } else {
        navigate('/');
      }
    } catch (err) {
      alert('Login failed: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p>Log in to continue managing your health needs.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
