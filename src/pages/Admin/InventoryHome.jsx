import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Inventory.scss";

const InventoryHome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith("/staff") ? "/staff/inventory" : "/admin/inventory";

  const role = localStorage.getItem("role");
  const canSeeReports = ["super_admin", "admin", "accountant", "branch_manager"].includes(role);
  const canManageTax = ["super_admin", "admin", "accountant"].includes(role);
  const canApprove = ["super_admin", "admin"].includes(role);

  const cards = [
    {
      title: "Products",
      description: "Browse, search, and manage product details.",
      path: `${basePath}/products`,
    },
    {
      title: "Suppliers",
      description: "Vendor list, contacts, and balances.",
      path: `${basePath}/suppliers`,
    },
    {
      title: "Supplier Invoices",
      description: "Track deliveries, invoices, and payments.",
      path: `${basePath}/invoices`,
    },
    {
      title: "Receive Supplies",
      description: "Record new stock receipts and update inventory.",
      path: `${basePath}/receive`,
    },
    {
      title: "Stock Taking",
      description: "Compare shelf counts with system stock.",
      path: `${basePath}/stock-taking`,
    },
    ...(canSeeReports
      ? [
          {
            title: "Reports",
            description: "Sales, tax, returns, and inventory reports.",
            path: `${basePath}/reports`,
          },
        ]
      : []),
    ...(canManageTax
      ? [
          {
            title: "Tax Settings",
            description: "Manage VAT rates and effective dates.",
            path: `${basePath}/tax`,
          },
        ]
      : []),
    ...(canApprove
      ? [
          {
            title: "Approvals",
            description: "Approve large adjustments or refunds.",
            path: `${basePath}/approvals`,
          },
        ]
      : []),
  ];

  return (
    <div className="inventory-home">
      <div className="inventory-header">
        <h2>Inventory</h2>
        <p className="muted">Manage products, suppliers, invoices, and stock control.</p>
      </div>
      <div className="inventory-grid">
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            className="inventory-card"
            onClick={() => navigate(card.path)}
          >
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InventoryHome;
