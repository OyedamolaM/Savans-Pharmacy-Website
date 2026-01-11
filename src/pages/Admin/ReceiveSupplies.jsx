import React, { useEffect } from "react";
import SupplierInvoices from "./SupplierInvoices";

const ReceiveSupplies = () => {
  useEffect(() => {
    document.title = "Receive Supplies";
  }, []);

  return <SupplierInvoices defaultCreateOpen />;
};

export default ReceiveSupplies;
