import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CartProvider from './Context/CartContext';
import { SearchProvider } from './context/SearchContext'; // ✅

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <SearchProvider>
        <App />
      </SearchProvider>
    </CartProvider>
  </React.StrictMode>
);
