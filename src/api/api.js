// src/api/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // replace with deployed URL later

// Products
export const getProducts = () => axios.get(`${API_URL}/products`);
export const getProduct = (id) => axios.get(`${API_URL}/products/${id}`);

// User authentication
export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data);
export const loginUser = (data) => axios.post(`${API_URL}/auth/login`, data);

// Wishlist

export const getWishlist = async () => {
  const token = localStorage.getItem("token"); // token stored on login
  if (!token) throw new Error("No token found, please log in");

  return axios.get("http://localhost:5000/api/wishlist", {
    headers: { Authorization: `Bearer ${token}` },
  });
};


// Add more endpoints as needed
