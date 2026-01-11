import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Customer/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import StaffDashboard from './pages/Staff/StaffDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/cart"
          element={
            <PrivateRoute role="user">
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <PrivateRoute role="user">
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="/checkout/success"
          element={
            <PrivateRoute role="user">
              <CheckoutSuccess />
            </PrivateRoute>
          }
        />
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
            <PrivateRoute roles={["super_admin", "admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Staff Dashboard (staff roles) */}
        <Route
          path="/staff/*"
          element={
            <PrivateRoute
              roles={[
                "branch_manager",
                "accountant",
                "inventory_manager",
                "cashier",
                "staff",
              ]}
            >
              <StaffDashboard />
            </PrivateRoute>
          }
        />
      </Routes>

      <Footer />
    </>
  );
};

export default App;
