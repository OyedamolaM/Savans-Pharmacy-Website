import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Cart from './pages/cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/home';
import Dashboard from './pages/Customer/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/privateRoute';

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Customer Dashboard (user role) */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute role="user">
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Admin Dashboard (admin role) */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
