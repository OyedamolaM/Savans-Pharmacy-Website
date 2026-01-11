import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminHome from "./AdminHome";
import AdminDashboardLayout from "./AdminDashboardLayout";
import Products from "./Products";
import Orders from "./Orders";
import Customers from "./Customers";
import Staff from "./Staff";
import Branches from "./Branches";
import BranchDetail from "./BranchDetail";
import InventoryHome from "./InventoryHome";
import InventoryLayout from "./InventoryLayout";
import Suppliers from "./Suppliers";
import SupplierInvoices from "./SupplierInvoices";
import ReceiveSupplies from "./ReceiveSupplies";
import StockTaking from "./StockTaking";
import ProductDetail from "./ProductDetail";
import ActivityLog from "./ActivityLog";
import InventoryReports from "./InventoryReports";
import TaxRates from "./TaxRates";
import Approvals from "./Approvals";

const AdminDashboard = () => {
  return (
    <Routes>
      <Route element={<AdminDashboardLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="orders" element={<Orders />} />
        <Route path="customers" element={<Customers />} />
        <Route path="staff" element={<Staff />} />
        <Route path="branches" element={<Branches />} />
        <Route path="branches/:branchId" element={<BranchDetail />} />
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
        <Route path="activity" element={<ActivityLog />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;


