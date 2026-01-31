import React, { useEffect, useState } from 'react';
import './SubscribeModal.scss';

const SubscribeModal = ({ delayMs = 30000 }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('subscribe-modal-shown');
    if (alreadyShown) return;
    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem('subscribe-modal-shown', 'true');
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!open) return null;

  return (
    <div className="subscribe-modal">
      <button
        type="button"
        className="subscribe-modal__backdrop"
        onClick={() => setOpen(false)}
      />
      <div className="subscribe-modal__panel" role="dialog" aria-modal="true">
        <div className="subscribe-modal__header">
          <h3>Subscribe &amp; Save 15%</h3>
          <button type="button" className="text-btn" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <p>Get your favorite supplements delivered automatically and enjoy exclusive discounts.</p>
        <div className="subscribe-modal__form">
          <input type="email" placeholder="Enter your email" />
          <button type="button">Subscribe</button>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
