import React from "react";
import { Routes, Route } from "react-router-dom";
// import DashboardLayout from "./DashboardLayout";

import Orders from "./Orders";
import Wishlist from "./Wishlist";
import Profile from "./Profile";
import Shipping from "./Shipping";
import DashboardLayout from "./DashboardLayout";

const Dashboard = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<h2>Welcome to your Savans Account</h2>} />
        <Route path="orders" element={<Orders />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="profile" element={<Profile />} />
        <Route path="shipping" element={<Shipping />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;
