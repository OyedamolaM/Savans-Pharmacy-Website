import React, { useState } from 'react';
import { registerUser } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await registerUser({ name, email, password });
      alert(data.message || 'Registration successful! You can now log in.');
      setName('');
      setEmail('');
      setPassword('');
      navigate('/login'); // redirect to login after successful registration
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '50px auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h2>Register</h2>
      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit" style={{ padding: '10px', background: '#009688', color: '#fff', border: 'none', borderRadius: '5px' }}>
        Register
      </button>
    </form>
  );
};

export default Register;
