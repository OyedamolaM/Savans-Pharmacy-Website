// src/api/api.js
import axios from 'axios';
import { API_BASE_URL } from "./baseUrl";

const API_URL = `${API_BASE_URL}/api`;

const authHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found, please log in");
  return { Authorization: `Bearer ${token}` };
};

// Products
export const getProducts = () => axios.get(`${API_URL}/products`);
export const getProduct = (id) => axios.get(`${API_URL}/products/${id}`);

// User authentication
export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);
export const loginUser = (data) => axios.post(`${API_URL}/auth/login`, data);

// Wishlist

export const getWishlist = async () => {
  return axios.get(`${API_URL}/wishlist`, {
    headers: authHeaders(),
  });
};

// Cart
export const getCart = () =>
  axios.get(`${API_URL}/cart`, {
    headers: authHeaders(),
  });

export const addToCart = (productId, quantity = 1) =>
  axios.post(
    `${API_URL}/cart`,
    { productId, quantity },
    { headers: authHeaders() }
  );

export const updateCartItem = (productId, quantity) =>
  axios.put(
    `${API_URL}/cart/${productId}`,
    { quantity },
    { headers: authHeaders() }
  );

export const removeFromCart = (productId) =>
  axios.delete(`${API_URL}/cart/${productId}`, {
    headers: authHeaders(),
  });

export const clearCart = () =>
  axios.delete(`${API_URL}/cart`, {
    headers: authHeaders(),
  });

export const createOrder = (payload) =>
  axios.post(`${API_URL}/orders`, payload, {
    headers: authHeaders(),
  });

export const getProfile = () =>
  axios.get(`${API_URL}/user/profile`, {
    headers: authHeaders(),
  });

export const addShippingAddress = (payload) =>
  axios.post(`${API_URL}/user/shipping`, payload, {
    headers: authHeaders(),
  });


// Add more endpoints as needed
