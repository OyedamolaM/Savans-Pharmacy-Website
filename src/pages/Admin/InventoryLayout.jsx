import React from "react";
import { Outlet } from "react-router-dom";
import "./Inventory.scss";

const InventoryLayout = () => (
  <div className="inventory-layout">
    <Outlet />
  </div>
);

export default InventoryLayout;
