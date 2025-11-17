import React, { useState } from 'react';
import { XMarkIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { paymentService } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import LoadingButton from './LoadingButton';

export default function PaymentModal({ booking, isOpen, onClose, onPaymentSuccess }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    card_number: '',
    card_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  if (!isOpen || !booking) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'card_number') {
      const cleaned = value.replace(/\s/g, '');
      if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        setFormData({ ...formData, [name]: formatted });
      }
    } else if (name === 'expiry_month' || name === 'expiry_year') {
      // Only allow numbers
      if (/^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'cvv') {
      // Only allow 3-4 digits
      if (/^\d{0,4}$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.card_number || formData.card_number.replace(/\s/g, '').length < 13) {
      showToast('Please enter a valid card number', 'error');
      return;
    }
    if (!formData.card_name.trim()) {
      showToast('Please enter cardholder name', 'error');
      return;
    }
    if (!formData.expiry_month || !formData.expiry_year) {
      showToast('Please enter card expiry date', 'error');
      return;
    }
    if (!formData.cvv || formData.cvv.length < 3) {
      showToast('Please enter a valid CVV', 'error');
      return;
    }

    setLoading(true);
    try {
      // Create payment with card number (last 4 digits will be stored)
      const cardNumber = formData.card_number.replace(/\s/g, '');
      const payment = await paymentService.createPayment({
        booking: booking.id,
        card_number: cardNumber,
        payment_method: 'CARD',
        amount: booking.service_details?.price || booking.service?.price,
      });

      setPaymentCompleted(true);
      showToast('Payment processed successfully!', 'success');
      
      // Call success callback after a short delay
      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess(payment);
        }
        handleClose();
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Payment failed. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        card_number: '',
        card_name: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
      });
      setPaymentCompleted(false);
      onClose();
    }
  };

  const amount = booking.service_details?.price || booking.service?.price || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCardIcon className="w-6 h-6" />
            {paymentCompleted ? 'Payment Successful' : 'Complete Payment'}
          </h2>
          {!loading && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {paymentCompleted ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Payment Successful!</h3>
              <p className="text-gray-400">
                Your payment of <span className="font-semibold text-white">KES {amount.toLocaleString()}</span> has been processed.
              </p>
            </div>
          ) : (
            <>
              {/* Booking Summary */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Booking Summary</h3>
                <p className="text-white font-semibold">{booking.service_details?.title || booking.service?.title}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {new Date(booking.booking_date).toLocaleString()}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-600 flex justify-between items-center">
                  <span className="text-gray-300">Total Amount</span>
                  <span className="text-xl font-bold text-white">KES {amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="card_number"
                    value={formData.card_number}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    name="card_name"
                    value={formData.card_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Month
                    </label>
                    <input
                      type="text"
                      name="expiry_month"
                      value={formData.expiry_month}
                      onChange={handleChange}
                      placeholder="MM"
                      maxLength={2}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Year
                    </label>
                    <input
                      type="text"
                      name="expiry_year"
                      value={formData.expiry_year}
                      onChange={handleChange}
                      placeholder="YY"
                      maxLength={2}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mt-4">
                  <p className="text-xs text-blue-300">
                    <strong>Note:</strong> This is a demo payment system. No real charges will be made.
                    Use any card number for testing (e.g., 4242 4242 4242 4242).
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    type="submit"
                    loading={loading}
                    className="flex-1 px-4 py-2"
                  >
                    Pay KES {amount.toLocaleString()}
                  </LoadingButton>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

