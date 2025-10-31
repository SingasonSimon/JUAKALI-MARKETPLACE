import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { serviceService } from '../services/serviceService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dbUser } = useAuth();
  const { showToast } = useToast();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        setError(null);
        const serviceData = await serviceService.getServiceById(id);
        setService(serviceData);
      } catch (err) {
        setError('Failed to load service details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [id]);

  const handleBookService = async (e) => {
    e.preventDefault();
    
    if (!dbUser) {
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }

    if (dbUser.role !== 'SEEKER') {
      showToast('Only service seekers can book services.', 'error');
      return;
    }

    if (!bookingDate || !bookingTime) {
      showToast('Please select both date and time for your booking.', 'error');
      return;
    }

    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    
    if (bookingDateTime < new Date()) {
      showToast('Please select a future date and time.', 'error');
      return;
    }

    // Validate time is between 8am and 5pm
    const selectedHour = bookingDateTime.getHours();
    if (selectedHour < 8 || selectedHour >= 17) {
      showToast('Booking time must be between 8:00 AM and 5:00 PM.', 'error');
      return;
    }

    try {
      setBookingLoading(true);
      await bookingService.createBooking({
        service: id,
        booking_date: bookingDateTime.toISOString(),
      });
      
      showToast('Booking created successfully!', 'success');
      setShowBookingForm(false);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create booking.';
      showToast(errorMessage, 'error');
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-white py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-300">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="text-center py-20">
        <p className="text-xl mb-4 text-red-400 font-semibold">{error || 'Service not found'}</p>
        <Link to="/" className="text-blue-400 hover:text-blue-300 transition">
          Back to Home
        </Link>
      </div>
    );
  }

  const isProvider = dbUser?.role === 'PROVIDER' && dbUser?.id === service.provider;
  const canBook = dbUser?.role === 'SEEKER' && !isProvider;

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="bg-gray-800 rounded shadow-xl overflow-hidden border border-gray-700"
      >
        {/* Service Header */}
        <div className="p-8 border-b border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{service.title}</h1>
              <div className="flex items-center gap-4 text-gray-300">
                <span className="bg-gray-700 px-3 py-1 rounded text-gray-300">{service.category_details?.name || 'Uncategorized'}</span>
                <span className="text-gray-300">By {service.provider_details?.first_name} {service.provider_details?.last_name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-400 mb-2">
                KES {parseFloat(service.price).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <div className="p-8 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Description</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{service.description}</p>
        </div>

        {/* Provider Info */}
        <div className="p-8 border-b border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Provider Information</h2>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-200">
                <span className="font-semibold text-white">Name:</span> {service.provider_details?.first_name} {service.provider_details?.last_name}
              </p>
              <p className="text-gray-200 mt-2">
                <span className="font-semibold text-white">Email:</span> {service.provider_details?.email}
              </p>
            </div>
        </div>

        {/* Booking Section */}
        {isProvider ? (
          <div className="p-8">
            <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg p-4">
              <p className="text-blue-200 font-medium">This is your service. You can manage it from your dashboard.</p>
              <Link
                to="/dashboard"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : !dbUser ? (
          <div className="p-8">
            <div className="bg-gray-700 rounded-lg p-6 text-center">
              <p className="text-white mb-4 font-medium">Please sign in to book this service</p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/login"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        ) : canBook ? (
          <div className="p-8">
            {!showBookingForm ? (
              <LoadingButton
                onClick={() => setShowBookingForm(true)}
                className="w-full py-4 px-6 text-lg"
              >
                Book This Service
              </LoadingButton>
            ) : (
              <form onSubmit={handleBookService} className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Book Service</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={today}
                      required
                      disabled={bookingLoading}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Time (8:00 AM - 5:00 PM)
                    </label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      min="08:00"
                      max="17:00"
                      required
                      disabled={bookingLoading}
                      className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Available hours: 8:00 AM - 5:00 PM</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <LoadingButton
                    type="submit"
                    loading={bookingLoading}
                    className="flex-1 py-3 px-6"
                  >
                    Confirm Booking
                  </LoadingButton>
                  <LoadingButton
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    variant="secondary"
                    className="px-6 py-3"
                  >
                    Cancel
                  </LoadingButton>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="p-8">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-white font-medium">Only service seekers can book services.</p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

