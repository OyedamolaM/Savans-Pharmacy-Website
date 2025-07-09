import { Link } from 'react-router-dom';
import './Home.scss';

const featuredProducts = [
  {
    id: 1,
    name: 'Paracetamol Tablets',
    price: '₦500',
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 2,
    name: 'Vitamin C 1000mg',
    price: '₦1200',
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 3,
    name: 'Antiseptic Cream',
    price: '₦850',
    image: 'https://via.placeholder.com/150'
  },
];

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to Savans Pharmacy</h1>
        <p>Your health, our priority.</p>
        <Link to="/products" className="shop-btn">Shop Now</Link>
      </section>

      <section className="featured">
        <h2>Featured Products</h2>
        <div className="product-grid">
          {featuredProducts.map(product => (
            <div className="product-card" key={product.id}>
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
