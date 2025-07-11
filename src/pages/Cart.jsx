import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginModal from '../components/LoginModal';
import './Cart.scss';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <section className="cart-items" aria-label="Cart Items">
            {cartItems.map(item => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Price: ₦{parseFloat(item.price).toLocaleString()}</p>
                  <p>
                    Qty:
                    <button
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </p>
                  <p>Total: ₦{(parseFloat(item.price) * item.quantity).toLocaleString()}</p>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section className="cart-summary" aria-label="Cart Summary">
            <h3>Total: ₦{getTotalPrice().toLocaleString()}</h3>
            <button className="clear-cart" onClick={clearCart} aria-label="Clear cart">
              Clear Cart
            </button>
            <button className="checkout-btn" onClick={handleCheckout} aria-label="Proceed to Checkout">
              Proceed to Checkout
            </button>
          </section>
        </>
      )}

      {/* 👇 Login Modal renders conditionally */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={() => {
            setShowLogin(false);
            navigate('/checkout');
          }}
        />
      )}
    </div>
  );
}

export default Cart;
