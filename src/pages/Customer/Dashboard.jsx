import React from "react";
import { Routes, Route } from "react-router-dom";
// import DashboardLayout from "./DashboardLayout";

import Orders from "./Orders";
import Wishlist from "./Wishlist";
import Profile from "./Profile";
import Shipping from "./Shipping";
import DashboardLayout from "./DashboardLayout";
import Overview from "./Overview";

const Dashboard = () => {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="orders" element={<Orders />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="profile" element={<Profile />} />
        <Route path="shipping" element={<Shipping />} />
      </Route>
    </Routes>
  );
};

export default Dashboard;
