import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role, roles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;

  if (role && role !== userRole) return <Navigate to="/" />;
  if (roles && !roles.includes(userRole)) return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;
