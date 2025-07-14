import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import './ShippingPayment.scss';

function ShippingPayment() {
  const { cartItems, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    phone: '',
    city: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (paymentMethod === 'card') {
    payWithPaystack();
  } else {
    await saveOrder('pending');
    navigate('/order-confirmation');
  }
};

  const payWithPaystack = () => {
    const handler = window.PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxxx', // Replace with your real public key
      email: user?.email || 'guest@example.com',
      amount: getTotalPrice() * 100,
      currency: 'NGN',
      metadata: {
        cart: cartItems,
        shipping: shippingInfo,
      },
      callback: async function (response) {
        await saveOrder('paid', response.reference);
        navigate('/order-confirmation');
      },
      onClose: function () {
        alert('❌ Transaction canceled.');
      }
    });

    handler.openIframe();
  };

  const saveOrder = async (status, paymentRef = null) => {
  const orderId = uuidv4();

  try {
    const safeCartItems = cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      quantity: item.quantity,
    }));

    const safeShipping = {
      name: shippingInfo.name,
      address: shippingInfo.address,
      phone: shippingInfo.phone,
      city: shippingInfo.city,
      postalCode: shippingInfo.postalCode,
    };

    await setDoc(doc(db, 'orders', orderId), {
      orderId,
      userId: user?.uid || null,
      email: user?.email || 'guest@example.com',
      cartItems: safeCartItems,
      shippingInfo: safeShipping,
      paymentMethod,
      total: getTotalPrice(),
      paymentRef: paymentRef || null,
      status,
      createdAt: new Date().toISOString(), // ✅ safer than raw Date object
    });

  } catch (err) {
    console.error('❌ Error saving order:', err);
    alert('⚠️ Failed to save order. Please contact support.');
  }
};

  return (
    <div className="shipping-payment-page">
      <h2>Shipping & Payment</h2>

      <section className="cart-review">
        <h3>Review Your Items</h3>
        <ul className="checkout-items">
          {cartItems.map(item => {
            const unitPrice = parseFloat(item.price);
            const subtotal = unitPrice * item.quantity;
            return (
              <li key={item.id}>
                <span>{item.name}</span>
                <span>₦{unitPrice.toLocaleString()} × {item.quantity}</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </li>
            );
          })}
        </ul>
        <div className="checkout-total">
          <h4>Total: ₦{getTotalPrice().toLocaleString()}</h4>
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Shipping Info</legend>
          <input name="name" placeholder="Full Name" value={shippingInfo.name} onChange={handleChange} required />
          <input name="address" placeholder="Address" value={shippingInfo.address} onChange={handleChange} required />
          <input name="city" placeholder="City" value={shippingInfo.city} onChange={handleChange} required />
          <input name="postalCode" placeholder="Postal Code" value={shippingInfo.postalCode} onChange={handleChange} required />
          <input name="phone" placeholder="Phone Number" value={shippingInfo.phone} onChange={handleChange} required />
        </fieldset>

        <fieldset>
          <legend>Payment Method</legend>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Card Payment (via Paystack)
          </label>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Cash on Delivery
          </label>
        </fieldset>

        <button type="submit">Place Order</button>
      </form>
    </div>
  );
}

export default ShippingPayment;
