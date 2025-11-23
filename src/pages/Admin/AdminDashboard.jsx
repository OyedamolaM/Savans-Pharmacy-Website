import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminHome from "./AdminHome";
import AdminDashboardLayout from "./AdminDashboardLayout";
import Products from "./Products";
import Orders from "./Orders";
import Users from "./Users";

const AdminDashboard = () => {
  return (
    <Routes>
      <Route element={<AdminDashboardLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;


