import React, { useState } from 'react';
import { loginUser } from '../api/api';
import { useNavigate } from 'react-router-dom';

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
      localStorage.setItem('role', res.data.role); // "user" or "admin"

      // Redirect based on role
      if (res.data.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      alert('Login failed: ' + err.response?.data?.message || err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
