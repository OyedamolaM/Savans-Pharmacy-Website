// src/components/PaystackButton.jsx
import React from 'react';
import PaystackPop from '@paystack/inline-js';

function PaystackButton({ email, amountKobo, onSuccess, onClose }) {
  const handlePayment = () => {
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amountKobo,
      onSuccess: transaction => {
        console.log('Payment successful:', transaction.reference);
        onSuccess(transaction);
      },
      onCancel: onClose,
    });
  };

  return (
    <button onClick={handlePayment} className="paystack-btn">
      Pay Now
    </button>
  );
}

export default PaystackButton;
