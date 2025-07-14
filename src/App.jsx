import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import PrivateRoute from './components/PrivateRoute';
import ShippingPayment from './pages/ShippingPayment';
import OrderConfirmation from './pages/OrderConfirmation';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} /> {/* ✅ Add this route */}
        <Route path="/login" element={<Login />} />
        <Route
  path="/shipping-payment"
  element={<PrivateRoute>
          <ShippingPayment />
          </PrivateRoute>
          }/>
        <Route path="/order-confirmation" element={<OrderConfirmation />} />

      </Routes>
    </Router>
  );
}

export default App;
