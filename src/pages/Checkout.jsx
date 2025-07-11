import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.scss';

function Checkout() {
  const { cartItems, getTotalPrice } = useCart();
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <h2>Login Required</h2>
        <p>You must be logged in to proceed with checkout.</p>
        <button className="login-btn" onClick={login}>
          Click to Login
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h2>Checkout Summary</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="checkout-items">
            {cartItems.map(item => (
              <li key={item.id}>
                <span>{item.name}</span>
                <span>₦{parseFloat(item.price).toLocaleString()} × {item.quantity}</span>
              </li>
            ))}
          </ul>

          <div className="checkout-total">
            <h3>Total: ₦{getTotalPrice().toLocaleString()}</h3>
          </div>

          <button className="continue-btn" onClick={() => alert('Next step: Shipping / Payment (not implemented)')}>
            Continue to Payment
          </button>
        </>
      )}
    </div>
  );
}

export default Checkout;
