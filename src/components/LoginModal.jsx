import ReactDOM from 'react-dom';
import './LoginModal.scss';
import { useAuth } from '../context/AuthContext';

function LoginModal({ onClose, onLogin }) {
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    login(); // Fake login for now
    onLogin(); // Notify parent
  };

  return ReactDOM.createPortal(
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>
            Email:
            <input type="email" required />
          </label>
          <label>
            Password:
            <input type="password" required />
          </label>
          <button type="submit">Login</button>
          <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default LoginModal;
