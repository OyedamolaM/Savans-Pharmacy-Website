import { useEffect, useState } from 'react';
import { getWishlist } from '../../api/api';
import "./Account.scss";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await getWishlist();
        setWishlist(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch wishlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <p className="account-muted">Loading wishlist...</p>;
  if (error) return <p className="account-muted">{error}</p>;
  if (wishlist.length === 0) return <p className="account-muted">Your wishlist is empty.</p>;

  return (
    <div className="account-section">
      <h2>Wishlist</h2>
      <div className="wishlist-grid">
        {wishlist.map(item => (
          <div key={item._id} className="wishlist-item">
          <h3>{item.title}</h3>
          <p>₦{item.price}</p>
          <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
