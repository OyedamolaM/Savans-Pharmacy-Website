import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api/baseUrl";
import "./Orders.scss";

const Orders = () => {
  const toTitleCase = (value = "") =>
    value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const [orders, setOrders] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [inventoryByProduct, setInventoryByProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [claimingOrderId, setClaimingOrderId] = useState(null);
  const [claimBranchByOrder, setClaimBranchByOrder] = useState({});
  const [returningOrderId, setReturningOrderId] = useState(null);

  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [newOrder, setNewOrder] = useState({
    customerId: "",
    branchId: "",
    products: [],
    shippingAddress: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      phone: "",
    },
    paymentMethod: "Cash on Delivery",
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    costPrice: "",
    sellingPrice: "",
    expiryDate: "",
    quantityAvailable: "",
    sku: "",
    batchNumber: "",
    barcode: "",
    supplier: "",
    reorderLevel: "",
    category: "",
    images: [],
  });

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const canManageOrders = ["super_admin", "admin", "branch_manager", "cashier"].includes(role);
  const canReturnOrders = ["super_admin", "admin"].includes(role);
  const canManageInventory = ["super_admin", "admin", "inventory_manager"].includes(role);
  const canSelectBranch = ["super_admin", "admin"].includes(role);
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };
  const API_URL = `${API_BASE_URL}/api/admin/orders`;
  const selectedBranch = canSelectBranch
    ? branches.find((branch) => branch._id === newOrder.branchId)
    : currentBranch;
  const isOnlineBranch = Boolean(selectedBranch?.isOnline);

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return productsCatalog;
    return productsCatalog.filter((product) =>
      product.title.toLowerCase().includes(term)
    );
  }, [productSearch, productsCatalog]);

  const buildAddressPayload = (address) => ({
    fullName: address?.fullName || "",
    addressLine1: address?.addressLine1 || "",
    addressLine2: address?.addressLine2 || "",
    city: address?.city || "",
    state: address?.state || "",
    country: address?.country || "",
    postalCode: address?.postalCode || "",
    phone: address?.phone || "",
  });

  const formatAddress = (address) => {
    if (!address) return "";
    const parts = [
      address.fullName,
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.country,
      address.postalCode,
      address.phone,
    ].filter((value) => value && value.trim());
    return parts.join(", ");
  };

  const getAvailableQuantity = (productId) =>
    inventoryByProduct[productId] ?? 0;

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(API_URL, axiosConfig);
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [productsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/products`),
        axios.get(`${API_BASE_URL}/api/admin/users?type=customers`, axiosConfig),
      ]);
      setProductsCatalog(productsRes.data || []);
      setCustomers(
        (usersRes.data || []).filter((user) => user.role === "user")
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load products or customers");
    } finally {
      setLoadingMeta(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/branches`, axiosConfig);
      setBranches(data || []);
      if (canSelectBranch && !newOrder.branchId && data?.length) {
        setNewOrder((prev) => ({ ...prev, branchId: data[0]._id }));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load branches");
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/user/profile`, axiosConfig);
      if (data.branch) {
        setCurrentBranch(data.branch);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBranchInventory = async (branchId) => {
    if (!branchId) {
      setInventoryByProduct({});
      return;
    }
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/branches/${branchId}/inventory`,
        axiosConfig
      );
      const nextMap = {};
      (data || []).forEach((item) => {
        if (item.product?._id) {
          nextMap[item.product._id] = item.quantity;
        }
      });
      setInventoryByProduct(nextMap);
    } catch (err) {
      console.error(err);
      setInventoryByProduct({});
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMeta();
    if (canSelectBranch) {
      fetchBranches();
    } else {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (!newOrder.customerId) {
      setSelectedAddressId("");
      return;
    }

    const customer = customers.find(
      (item) => item._id === newOrder.customerId
    );
    if (customer?.shippingAddresses?.length) {
      const lastAddress =
        customer.shippingAddresses[customer.shippingAddresses.length - 1];
      setSelectedAddressId(lastAddress._id || "");
      setNewOrder((prev) => ({
        ...prev,
        shippingAddress: buildAddressPayload(lastAddress),
      }));
    }
  }, [customers, newOrder.customerId]);

  useEffect(() => {
    const branchId = canSelectBranch ? newOrder.branchId : currentBranch?._id;
    fetchBranchInventory(branchId);
  }, [newOrder.branchId, currentBranch, canSelectBranch]);

  useEffect(() => {
    if (isOnlineBranch) return;
    setNewOrder((prev) => ({
      ...prev,
      products: prev.products
        .map((item) => {
          const availableQty = getAvailableQuantity(item.productId);
          if (availableQty <= 0) return null;
          return {
            ...item,
            quantity: Math.min(item.quantity, availableQty),
          };
        })
        .filter(Boolean),
    }));
  }, [inventoryByProduct, isOnlineBranch]);

  const handleStatusChange = async (orderId, status) => {
    if (status === "Returned" && canReturnOrders) {
      await handleReturnOrder(orderId);
      return;
    }
    try {
      const { data } = await axios.put(
        `${API_URL}/${orderId}`,
        { status },
        axiosConfig
      );
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? data : order))
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update order status");
    }
  };

  const handleClaimOnlineOrder = async (orderId) => {
    setClaimingOrderId(orderId);
    try {
      const selectedClaimBranch =
        claimBranchByOrder[orderId] || newOrder.branchId;
      const payload = canSelectBranch ? { branchId: selectedClaimBranch } : {};
      const { data } = await axios.post(
        `${API_URL}/${orderId}/claim`,
        payload,
        axiosConfig
      );
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? data : order))
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to claim online order");
    } finally {
      setClaimingOrderId(null);
    }
  };

  const handleReturnOrder = async (orderId) => {
    const reason = window.prompt("Reason for return");
    if (!reason) return;
    setReturningOrderId(orderId);
    try {
      const { data } = await axios.post(
        `${API_URL}/${orderId}/return`,
        { reason },
        axiosConfig
      );
      if (data?.approvalId) {
        setError("Return submitted for approval.");
      } else {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? data : order))
        );
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to return order");
    } finally {
      setReturningOrderId(null);
    }
  };

  const addProductToOrder = (product) => {
    setNewOrder((prev) => {
      const existing = prev.products.find(
        (item) => item.productId === product._id
      );
      const availableQty = getAvailableQuantity(product._id);
      if (!isOnlineBranch && availableQty === 0) {
        return prev;
      }
      if (existing) {
        const nextQty = existing.quantity + 1;
        const finalQty = isOnlineBranch
          ? nextQty
          : Math.min(nextQty, availableQty);
        return {
          ...prev,
          products: prev.products.map((item) =>
            item.productId === product._id
              ? { ...item, quantity: finalQty }
              : item
          ),
        };
      }

      return {
        ...prev,
        products: [
          ...prev.products,
          {
            productId: product._id,
            title: product.title,
            price: product.sellingPrice ?? product.price,
            quantity: 1,
          },
        ],
      };
    });
  };

  const updateProductQuantity = (productId, quantity) => {
    const nextQuantity = Number(quantity) || 0;
    if (nextQuantity <= 0) {
      removeProduct(productId);
      return;
    }
    const availableQty = getAvailableQuantity(productId);
    const finalQty = isOnlineBranch
      ? nextQuantity
      : Math.min(nextQuantity, availableQty);
    setNewOrder((prev) => ({
      ...prev,
      products: prev.products.map((item) =>
        item.productId === productId
          ? { ...item, quantity: finalQty }
          : item
      ),
    }));
  };

  const incrementProduct = (product) => {
    const availableQty = getAvailableQuantity(product._id);
    const currentQty =
      newOrder.products.find((item) => item.productId === product._id)?.quantity || 0;
    if (!isOnlineBranch && currentQty >= availableQty) return;
    addProductToOrder(product);
  };

  const decrementProduct = (productId) => {
    const currentQty =
      newOrder.products.find((item) => item.productId === productId)?.quantity || 0;
    const nextQty = currentQty - 1;
    updateProductQuantity(productId, nextQty);
  };

  const removeProduct = (productId) => {
    setNewOrder((prev) => ({
      ...prev,
      products: prev.products.filter((item) => item.productId !== productId),
    }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [name]: value },
    }));
  };

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "images") {
      setProductForm((prev) => ({ ...prev, images: files }));
      return;
    }
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreatingCustomer(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/admin/users`,
        {
          ...customerForm,
          role: "user",
        },
        axiosConfig
      );

      const newCustomer = data.user;
      setCustomers((prev) => [...prev, newCustomer]);
      setNewOrder((prev) => ({ ...prev, customerId: newCustomer._id }));
      setCustomerForm({ name: "", phone: "", email: "", password: "" });
      setIsCustomerModalOpen(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to create customer");
    } finally {
      setCreatingCustomer(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setCreatingProduct(true);

    try {
      const formData = new FormData();
      Object.entries(productForm).forEach(([key, value]) => {
        if (key === "images") {
          Array.from(value || []).forEach((file) =>
            formData.append("images", file)
          );
        } else if (value !== "") {
          formData.append(key, value);
        }
      });

      const { data } = await axios.post(
        `${API_BASE_URL}/api/admin/products`,
        formData,
        { headers: { ...axiosConfig.headers, "Content-Type": "multipart/form-data" } }
      );

      setProductsCatalog((prev) => [...prev, data]);
      addProductToOrder(data);
      setProductForm({
        title: "",
        description: "",
        costPrice: "",
        sellingPrice: "",
        expiryDate: "",
        quantityAvailable: "",
        sku: "",
        batchNumber: "",
        barcode: "",
        supplier: "",
        reorderLevel: "",
        category: "",
        images: [],
      });
      setIsCreateProductModalOpen(false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to create product");
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!newOrder.customerId) {
      setError("Please select a customer");
      return;
    }

    if (!canSelectBranch && !currentBranch) {
      setError("Your account is not assigned to a branch");
      return;
    }

    if (newOrder.products.length === 0) {
      setError("Please add at least one product");
      return;
    }

    if (canSelectBranch && !newOrder.branchId) {
      setError("Please select a branch");
      return;
    }

    if (isOnlineBranch) {
      const requiredShippingFields = [
        "fullName",
        "addressLine1",
        "city",
        "state",
        "country",
        "postalCode",
        "phone",
      ];
      const isShippingValid = requiredShippingFields.every(
        (field) => newOrder.shippingAddress[field]?.trim()
      );
      if (!isShippingValid) {
        setError("Please complete the shipping address");
        setIsShippingModalOpen(true);
        return;
      }
    }

    setCreatingOrder(true);
    try {
      const productsPayload = newOrder.products.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const payload = {
        customerId: newOrder.customerId,
        branchId: canSelectBranch ? newOrder.branchId : undefined,
        products: productsPayload,
        shippingAddress: newOrder.shippingAddress,
        paymentMethod: newOrder.paymentMethod,
      };

      const { data } = await axios.post(API_URL, payload, axiosConfig);
      setOrders((prev) => [data, ...prev]);
      setNewOrder({
        customerId: "",
        branchId: canSelectBranch ? newOrder.branchId : "",
        products: [],
        shippingAddress: {
          fullName: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          phone: "",
        },
        paymentMethod: "Cash on Delivery",
      });
      setProductSearch("");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to create order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const selectedCustomer = customers.find(
    (customer) => customer._id === newOrder.customerId
  );
  const savedAddresses = selectedCustomer?.shippingAddresses || [];
  const shippingSummary = Object.values(newOrder.shippingAddress)
    .filter((value) => value && value.trim())
    .join(", ");

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Orders</h2>
        {loadingMeta && <span className="orders-loading">Loading data...</span>}
      </div>
      {error && <p className="orders-error">{error}</p>}

      <div className="orders-actions">
        {canManageOrders ? (
          <button
            type="button"
            className="primary-button"
            onClick={() => setIsCreateOrderOpen(true)}
          >
            New Order
          </button>
        ) : (
          <p className="orders-error">You do not have permission to create orders.</p>
        )}
      </div>

      {isCreateOrderOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOrderOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Order</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsCreateOrderOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="modal-body">
              <div className="order-section">
                <div className="order-section-header">
                  <h3>Branch</h3>
                </div>
                {canSelectBranch ? (
                  <select
                    name="branchId"
                    value={newOrder.branchId}
                    onChange={(e) =>
                      setNewOrder((prev) => ({ ...prev, branchId: e.target.value }))
                    }
                    required
                  >
                    <option value="">Select branch</option>
                    {branches.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name} {branch.isOnline ? "(Online)" : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="order-helper">
                    {currentBranch?.name || "Branch not assigned"}
                  </p>
                )}
              </div>

              <div className="order-section">
                <div className="order-section-header">
                  <h3>Customer</h3>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setIsCustomerModalOpen(true)}
                  >
                    Add customer
                  </button>
                </div>
                <select
                  name="customerId"
                  value={newOrder.customerId}
                  onChange={(e) =>
                    setNewOrder((prev) => ({ ...prev, customerId: e.target.value }))
                  }
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {toTitleCase(customer.name)} ({customer.email}
                      {customer.phone ? `, ${customer.phone}` : ""})
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <p className="order-helper">
                    Selected: {toTitleCase(selectedCustomer.name)}
                  </p>
                )}
              </div>

              <div className="order-section">
                <div className="order-section-header">
                  <h3>Products</h3>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setIsProductsModalOpen(true)}
                  >
                    Add products
                  </button>
                </div>

                {newOrder.products.length === 0 ? (
                  <p className="order-helper">No products selected.</p>
                ) : (
                  <div className="products-list">
                    {newOrder.products.map((item) => (
                      <div key={item.productId} className="product-line">
                        <div>
                          <p className="product-title">{item.title}</p>
                          <span className="product-meta">₦{item.price}</span>
                        </div>
                        <div className="product-controls">
                          <button
                            type="button"
                            className="qty-button"
                            onClick={() => decrementProduct(item.productId)}
                          >
                            -
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-button"
                            onClick={() =>
                              updateProductQuantity(item.productId, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="link-button"
                            onClick={() => removeProduct(item.productId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="order-section">
                <div className="order-section-header">
                  <h3>Shipping Address</h3>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setIsShippingModalOpen(true)}
                  >
                    Edit address
                  </button>
                </div>
                {savedAddresses.length > 0 && (
                  <div className="saved-addresses">
                    <p className="order-helper">Saved addresses for this customer:</p>
                    <div className="saved-address-list">
                      {savedAddresses.map((address) => (
                        <button
                          key={address._id}
                          type="button"
                          className={`saved-address ${
                            selectedAddressId === address._id ? "active" : ""
                          }`}
                          onClick={() => {
                            setSelectedAddressId(address._id);
                            setNewOrder((prev) => ({
                              ...prev,
                              shippingAddress: buildAddressPayload(address),
                            }));
                          }}
                        >
                          {formatAddress(address)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <p className="order-helper">
                  {shippingSummary || "No shipping address provided yet."}
                </p>
              </div>

              <div className="order-section">
                <h3>Payment Method</h3>
                <select
                  name="paymentMethod"
                  value={newOrder.paymentMethod}
                  onChange={(e) =>
                    setNewOrder((prev) => ({
                      ...prev,
                      paymentMethod: e.target.value,
                    }))
                  }
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <button type="submit" disabled={creatingOrder}>
                {creatingOrder ? "Creating order..." : "Create Order"}
              </button>
            </form>
          </div>
        </div>
      )}

      <h2>All Orders</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Branch</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Total (₦)</th>
            <th>Status</th>
            <th>Update Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const total =
              order.totalPrice ||
              order.products?.reduce(
                (sum, p) => sum + p.quantity * (p.price || 0),
                0
              );
            const statusValue = order.orderStatus || order.status || "Processing";
            const isOnlineOrder = Boolean(order.branch?.isOnline);
            const claimBranches = branches.filter((branch) => !branch.isOnline);
            const selectedClaimBranch =
              claimBranchByOrder[order._id] ||
              (claimBranches[0]?._id || newOrder.branchId || "");
            const isReturned = statusValue === "Returned";

            return (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>
                  {order.branch?.name || "-"}
                  {isOnlineOrder ? " (Online)" : ""}
                </td>
                <td>
                  {order.user
                    ? toTitleCase(order.user.name)
                    : "User removed"}
                </td>
                <td>
                  {order.products?.map((p, idx) => (
                    <div key={p._id || idx}>
                      {p.title
                        ? `${p.title} x ${p.quantity} (₦${p.price})`
                        : "Product removed"}
                    </div>
                  ))}
                </td>
                <td>₦{total}</td>
                <td>{statusValue}</td>
                <td>
                  {canManageOrders ? (
                    <select
                      value={statusValue}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      {canReturnOrders && <option value="Returned">Returned</option>}
                    </select>
                  ) : (
                    <span className="muted">No access</span>
                  )}
                </td>
                <td>
                  {isOnlineOrder ? (
                    <div className="order-actions">
                      {canSelectBranch && (
                        <select
                          value={selectedClaimBranch}
                          onChange={(e) =>
                            setClaimBranchByOrder((prev) => ({
                              ...prev,
                              [order._id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select branch</option>
                          {claimBranches.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => handleClaimOnlineOrder(order._id)}
                        disabled={
                          claimingOrderId === order._id ||
                          (canSelectBranch && !selectedClaimBranch)
                        }
                      >
                        {claimingOrderId === order._id
                          ? "Claiming..."
                          : "Claim"}
                      </button>
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          axios
                            .get(`${API_URL}/${order._id}/receipt`, {
                              headers: { Authorization: `Bearer ${token}` },
                              responseType: "blob",
                            })
                            .then((response) => {
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute("download", `receipt-${order._id}.pdf`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                            })
                            .catch((err) => {
                              console.error("Failed to download receipt", err);
                              setError("Failed to download receipt");
                            });
                        }}
                      >
                        Receipt
                      </button>
                    </div>
                  ) : (
                    <div className="order-actions">
                      {canReturnOrders ? (
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => handleReturnOrder(order._id)}
                          disabled={returningOrderId === order._id || isReturned}
                        >
                          {returningOrderId === order._id ? "Returning..." : "Return"}
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => {
                          const token = localStorage.getItem("token");
                          axios
                            .get(`${API_URL}/${order._id}/receipt`, {
                              headers: { Authorization: `Bearer ${token}` },
                              responseType: "blob",
                            })
                            .then((response) => {
                              const url = window.URL.createObjectURL(new Blob([response.data]));
                              const link = document.createElement("a");
                              link.href = url;
                              link.setAttribute("download", `receipt-${order._id}.pdf`);
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                            })
                            .catch((err) => {
                              console.error("Failed to download receipt", err);
                              setError("Failed to download receipt");
                            });
                        }}
                      >
                        Receipt
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {isProductsModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsProductsModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Products</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsProductsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search products"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              {canManageInventory && (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setIsProductsModalOpen(false);
                    setIsCreateProductModalOpen(true);
                  }}
                >
                  Create new product
                </button>
              )}
              <div className="product-select-list">
                {filteredProducts.map((product) => {
                  const selectedQty =
                    newOrder.products.find(
                      (item) => item.productId === product._id
                    )?.quantity || 0;
                  const availableQty = getAvailableQuantity(product._id);
                  const isUnavailable = !isOnlineBranch && availableQty === 0;
                  const canIncrease =
                    isOnlineBranch || selectedQty < availableQty;
                  return (
                    <div key={product._id} className="product-option">
                      <div>
                        <p className="product-title">{product.title}</p>
                        <span className="product-meta">
                          ₦{product.sellingPrice ?? product.price} •{" "}
                          {isOnlineBranch
                            ? "Unlimited"
                            : `In stock: ${availableQty}`}
                        </span>
                      </div>
                      <div className="qty-stepper">
                        <button
                          type="button"
                          className="qty-button"
                          onClick={() => decrementProduct(product._id)}
                          disabled={selectedQty === 0}
                        >
                          -
                        </button>
                        <span className="qty-value">{selectedQty}</span>
                        <button
                          type="button"
                          className="qty-button"
                          onClick={() => incrementProduct(product)}
                          disabled={isUnavailable || !canIncrease}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isShippingModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsShippingModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Shipping Address</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsShippingModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-body">
              <div className="form-grid">
                <label>
                  Full Name
                  <input
                    type="text"
                    name="fullName"
                    value={newOrder.shippingAddress.fullName}
                    onChange={handleShippingChange}
                    required={isOnlineBranch}
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="text"
                    name="phone"
                    value={newOrder.shippingAddress.phone}
                    onChange={handleShippingChange}
                    required={isOnlineBranch}
                  />
                </label>
                <label className="full-width">
                  Address Line 1
                  <input
                    type="text"
                    name="addressLine1"
                    value={newOrder.shippingAddress.addressLine1}
                    onChange={handleShippingChange}
                    required={isOnlineBranch}
                  />
                </label>
                <label className="full-width">
                  Address Line 2
                  <input
                    type="text"
                    name="addressLine2"
                    value={newOrder.shippingAddress.addressLine2}
                    onChange={handleShippingChange}
                  />
                </label>
                <label>
                  City
                  <input
                    type="text"
                    name="city"
                    value={newOrder.shippingAddress.city}
                    onChange={handleShippingChange}
                    required={isOnlineBranch}
                  />
                </label>
                <label>
                  State
                  <input
                    type="text"
                    name="state"
                    value={newOrder.shippingAddress.state}
                    onChange={handleShippingChange}
                    required={isOnlineBranch}
                  />
                </label>
                <label>
                  Country
                  <input
                    type="text"
                    name="country"
                    value={newOrder.shippingAddress.country}
                    onChange={handleShippingChange}
                    required={isOnlineBranch}
                  />
                </label>
                <label>
                  Postal Code
                  <input
                    type="text"
                    name="postalCode"
                    value={newOrder.shippingAddress.postalCode}
                    onChange={handleShippingChange}
                    required={isOnlineBranch}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setIsShippingModalOpen(false)}
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCustomerModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsCustomerModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Customer</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsCustomerModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleCreateCustomer}>
              <div className="form-grid">
                <label className="full-width">
                  Name
                  <input
                    type="text"
                    name="name"
                    value={customerForm.name}
                    onChange={handleCustomerChange}
                    required
                  />
                </label>
                <label className="full-width">
                  Phone
                  <input
                    type="text"
                    name="phone"
                    value={customerForm.phone}
                    onChange={handleCustomerChange}
                    required
                  />
                </label>
                <label className="full-width">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={customerForm.email}
                    onChange={handleCustomerChange}
                    required
                  />
                </label>
                <label className="full-width">
                  Temporary Password
                  <input
                    type="password"
                    name="password"
                    value={customerForm.password}
                    onChange={handleCustomerChange}
                    required
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={creatingCustomer}>
                  {creatingCustomer ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateProductModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsCreateProductModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Product</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsCreateProductModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form className="modal-body" onSubmit={handleCreateProduct}>
              <div className="form-grid">
                <label className="full-width">
                  Product Name
                  <input
                    type="text"
                    name="title"
                    value={productForm.title}
                    onChange={handleProductFormChange}
                    required
                  />
                </label>
                <label className="full-width">
                  Description
                  <input
                    type="text"
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                  />
                </label>
                <label>
                  Cost Price (₦)
                  <input
                    type="number"
                    name="costPrice"
                    value={productForm.costPrice}
                    onChange={handleProductFormChange}
                  />
                </label>
                <label>
                  Selling Price (₦)
                  <input
                    type="number"
                    name="sellingPrice"
                    value={productForm.sellingPrice}
                    onChange={handleProductFormChange}
                    required
                  />
                </label>
                <label>
                  Quantity Available
                  <input
                    type="number"
                    name="quantityAvailable"
                    value={productForm.quantityAvailable}
                    onChange={handleProductFormChange}
                    required
                  />
                </label>
                <label>
                  Expiry Date
                  <input
                    type="date"
                    name="expiryDate"
                    value={productForm.expiryDate}
                    onChange={handleProductFormChange}
                  />
                </label>
                <label>
                  SKU
                  <input
                    type="text"
                    name="sku"
                    value={productForm.sku}
                    onChange={handleProductFormChange}
                  />
                </label>
                <label>
                  Batch Number
                  <input
                    type="text"
                    name="batchNumber"
                    value={productForm.batchNumber}
                    onChange={handleProductFormChange}
                  />
                </label>
                <label>
                  Barcode
                  <input
                    type="text"
                    name="barcode"
                    value={productForm.barcode}
                    onChange={handleProductFormChange}
                  />
                </label>
                <label>
                  Supplier
                  <input
                    type="text"
                    name="supplier"
                    value={productForm.supplier}
                    onChange={handleProductFormChange}
                  />
                </label>
                <label>
                  Reorder Level
                  <input
                    type="number"
                    name="reorderLevel"
                    value={productForm.reorderLevel}
                    onChange={handleProductFormChange}
                  />
                </label>
                <label>
                  Category
                  <input
                    type="text"
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                  />
                </label>
                <label className="full-width">
                  Images
                  <input
                    type="file"
                    name="images"
                    multiple
                    onChange={handleProductFormChange}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" disabled={creatingProduct}>
                  {creatingProduct ? "Creating..." : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
