import React from "react";
import { Routes, Route } from "react-router-dom";
import StaffDashboardLayout from "./StaffDashboardLayout";
import StaffHome from "./StaffHome";
import Orders from "../Admin/Orders";
import Products from "../Admin/Products";
import Users from "../Admin/Users";
import Branches from "../Admin/Branches";
import BranchDetail from "../Admin/BranchDetail";
import InventoryLayout from "../Admin/InventoryLayout";
import InventoryHome from "../Admin/InventoryHome";
import Suppliers from "../Admin/Suppliers";
import SupplierInvoices from "../Admin/SupplierInvoices";
import ReceiveSupplies from "../Admin/ReceiveSupplies";
import StockTaking from "../Admin/StockTaking";
import ProductDetail from "../Admin/ProductDetail";
import ActivityLog from "../Admin/ActivityLog";
import InventoryReports from "../Admin/InventoryReports";
import TaxRates from "../Admin/TaxRates";
import Approvals from "../Admin/Approvals";

const StaffDashboard = () => {
  return (
    <Routes>
      <Route element={<StaffDashboardLayout />}>
        <Route index element={<StaffHome />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Users defaultView="customers" showToggle={false} />} />
        <Route path="inventory" element={<InventoryLayout />}>
          <Route index element={<InventoryHome />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:productId" element={<ProductDetail />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="invoices" element={<SupplierInvoices />} />
          <Route path="receive" element={<ReceiveSupplies />} />
          <Route path="stock-taking" element={<StockTaking />} />
          <Route path="reports" element={<InventoryReports />} />
          <Route path="tax" element={<TaxRates />} />
          <Route path="approvals" element={<Approvals />} />
        </Route>
        <Route path="branches" element={<Branches />} />
        <Route path="branches/:branchId" element={<BranchDetail />} />
        <Route path="activity" element={<ActivityLog />} />
      </Route>
    </Routes>
  );
};

export default StaffDashboard;
