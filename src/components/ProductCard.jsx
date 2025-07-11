import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import './ProductCard.scss';

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="product-card">
      {product.badge && <span className="badge">{product.badge}</span>}
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">₦{product.price.toLocaleString()}</p>
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
}

export default ProductCard;
