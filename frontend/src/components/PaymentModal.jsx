import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CreditCardIcon, CheckCircleIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { paymentService } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import LoadingButton from './LoadingButton';

export default function PaymentModal({ booking, payment, isOpen, onClose, onPaymentSuccess }) {
  const { showToast } = useToast();
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(payment || booking?.payment);
  const [uploading, setUploading] = useState(false);
  const [fetchingPayment, setFetchingPayment] = useState(false);

  // Initialize payment data from booking or payment prop
  useEffect(() => {
    if (isOpen && booking) {
      // Priority: payment prop > booking.payment object > booking.payment ID > null
      if (payment) {
        setPaymentData(payment);
      } else if (booking.payment) {
        if (typeof booking.payment === 'object' && booking.payment.id) {
          // booking.payment is already a full payment object
          setPaymentData(booking.payment);
        } else if (typeof booking.payment === 'number' || typeof booking.payment === 'string') {
          // booking.payment is just an ID (number or string), fetch it
          const fetchPayment = async () => {
            try {
              setFetchingPayment(true);
              const paymentId = typeof booking.payment === 'string' ? parseInt(booking.payment) : booking.payment;
              const paymentDetails = await paymentService.getPayment(paymentId);
              setPaymentData(paymentDetails);
            } catch (error) {
              console.error('Error fetching payment:', error);
              setPaymentData(null);
            } finally {
              setFetchingPayment(false);
            }
          };
          fetchPayment();
        } else {
          setPaymentData(null);
        }
      } else {
        setPaymentData(null);
      }
    } else if (!isOpen) {
      // Reset when modal closes
      setPaymentData(null);
      setScreenshotFile(null);
      setScreenshotPreview(null);
    }
  }, [isOpen, booking, payment]);

  if (!isOpen || !booking) return null;

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      setScreenshotFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadScreenshot = async () => {
    if (!screenshotFile) {
      showToast('Please select a screenshot file', 'error');
      return;
    }

    if (!paymentData || !paymentData.id) {
      showToast('Payment not found', 'error');
      return;
    }

    setUploading(true);
    try {
      const updatedPayment = await paymentService.uploadPaymentScreenshot(paymentData.id, screenshotFile);
      setPaymentData(updatedPayment);
      showToast('Payment screenshot uploaded successfully! Waiting for admin verification.', 'success');
      if (onPaymentSuccess) {
        onPaymentSuccess(updatedPayment);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Failed to upload screenshot. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePayment = async () => {
    setLoading(true);
    try {
      const newPayment = await paymentService.createPayment({
        booking: booking.id,
        payment_method: 'M_PESA',
        amount: booking.service_details?.price || booking.service?.price,
      });
      setPaymentData(newPayment);
      showToast('Payment created. Waiting for provider to set payment details.', 'success');
      if (onPaymentSuccess) {
        onPaymentSuccess(newPayment);
      }
    } catch (error) {
      // If payment already exists, try to fetch it instead
      const errorData = error.response?.data;
      const errorMessage = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.detail || error.message);
      const errorText = errorMessage?.toLowerCase() || '';
      
      if (error.response?.status === 400 && errorText.includes('already exists')) {
        try {
          // Try to get payment ID from error response or booking
          let paymentId = errorData?.payment_id;
          
          if (!paymentId && booking?.payment) {
            paymentId = typeof booking.payment === 'object' && booking.payment.id 
              ? booking.payment.id 
              : booking.payment;
          }
          
          if (paymentId) {
            const existingPayment = typeof paymentId === 'object' && paymentId.id
              ? paymentId
              : await paymentService.getPayment(paymentId);
            setPaymentData(existingPayment);
            showToast('Payment already exists. Loading payment details...', 'info');
            if (onPaymentSuccess) {
              onPaymentSuccess(existingPayment);
            }
          } else if (booking?.payment) {
            // booking.payment exists but we need to fetch it
            let existingPayment;
            if (typeof booking.payment === 'object' && booking.payment.id) {
              existingPayment = booking.payment;
            } else {
              existingPayment = await paymentService.getPayment(booking.payment);
            }
            setPaymentData(existingPayment);
            showToast('Payment already exists. Loading payment details...', 'info');
            if (onPaymentSuccess) {
              onPaymentSuccess(existingPayment);
            }
          } else {
            // Refresh bookings to get updated payment data
            showToast('Payment already exists. Please refresh the page.', 'info');
            if (onPaymentSuccess) {
              // Trigger refresh
              onPaymentSuccess(null);
            }
          }
        } catch (fetchError) {
          console.error('Error fetching existing payment:', fetchError);
          showToast('Payment already exists. Please refresh the page to see payment details.', 'info');
        }
      } else {
        showToast(errorMessage || 'Failed to create payment. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !uploading) {
      setScreenshotFile(null);
      setScreenshotPreview(null);
      onClose();
    }
  };

  const amount = booking.service_details?.price || booking.service?.price || 0;
  const paymentStatus = paymentData?.status;
  const providerPaymentNumber = paymentData?.provider_payment_number;
  const hasScreenshot = paymentData?.payment_screenshot;
  const isVerified = paymentData?.admin_verified;
  const isCompleted = paymentStatus === 'COMPLETED';
  const isPendingVerification = paymentStatus === 'PENDING_VERIFICATION';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCardIcon className="w-6 h-6" />
            {isCompleted ? 'Payment Completed' : 'M-Pesa Payment'}
          </h2>
          {!loading && !uploading && (
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

          {/* Payment Status */}
          {fetchingPayment && (
            <div className="text-center py-4">
              <p className="text-gray-400">Loading payment details...</p>
            </div>
          )}

          {!fetchingPayment && !paymentData && (
            <div className="space-y-4">
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  Create a payment to proceed. Payment details will be automatically set from the provider's profile.
                </p>
              </div>
              <LoadingButton
                onClick={handleCreatePayment}
                loading={loading}
                variant="primary"
                size="lg"
                className="w-full"
              >
                <CreditCardIcon className="w-5 h-5" />
                Create Payment
              </LoadingButton>
            </div>
          )}

          {!fetchingPayment && paymentData && !providerPaymentNumber && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                <strong>Payment details not set:</strong> The provider hasn't set their payment information in their profile yet. 
                Please contact the provider or wait for them to update their profile.
              </p>
            </div>
          )}

          {paymentData && providerPaymentNumber && !hasScreenshot && (
            <div className="space-y-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <h3 className="text-green-300 font-semibold mb-2">Payment Instructions</h3>
                <div className="space-y-2 text-sm text-green-200">
                  <p>1. Send <strong className="text-white">KES {amount.toLocaleString()}</strong> to:</p>
                  <p className="text-lg font-bold text-white text-center py-2 bg-gray-800 rounded">
                    {providerPaymentNumber}
                  </p>
                  <p>2. After payment, upload a screenshot of the M-Pesa confirmation message below.</p>
                </div>
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload M-Pesa Screenshot
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition">
                  {screenshotPreview ? (
                    <div className="space-y-2">
                      <img src={screenshotPreview} alt="Screenshot preview" className="max-h-48 mx-auto rounded" />
                      <LoadingButton
                        type="button"
                        onClick={() => {
                          setScreenshotFile(null);
                          setScreenshotPreview(null);
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-sm"
                      >
                        Remove
                      </LoadingButton>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-1">Click to select screenshot</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <LoadingButton
                onClick={handleUploadScreenshot}
                loading={uploading}
                disabled={!screenshotFile}
                variant="success"
                size="lg"
                className="w-full"
              >
                <ArrowUpTrayIcon className="w-5 h-5" />
                Upload Screenshot
              </LoadingButton>
            </div>
          )}

          {paymentData && hasScreenshot && isPendingVerification && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <CheckCircleIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-300 text-center">
                <strong>Screenshot uploaded!</strong> Waiting for admin verification.
              </p>
            </div>
          )}

          {paymentData && isCompleted && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className="text-green-300 font-semibold mb-1">Payment Verified!</h3>
              <p className="text-green-200 text-sm">
                Your payment has been verified and completed.
              </p>
            </div>
          )}

          <div className="mt-4">
            <LoadingButton
              onClick={handleClose}
              disabled={loading || uploading}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              Close
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}

