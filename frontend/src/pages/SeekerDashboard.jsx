import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HandRaisedIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  WrenchScrewdriverIcon,
  AcademicCapIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { serviceService } from '../services/serviceService';
import { bookingService } from '../services/bookingService';
import { categoryService } from '../services/categoryService';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ComplaintForm from '../components/ComplaintForm';
import { ServiceCardSkeleton, BookingCardSkeleton, StatsCardSkeleton } from '../components/LoadingSkeleton';
import Pagination from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';

// Booking Modal Component
function BookingModal({ service, isOpen, onClose, onConfirm, loading }) {
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [error, setError] = useState('');

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!bookingDate || !bookingTime) {
      setError('Please select both date and time.');
      return;
    }

    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    
    if (bookingDateTime < new Date()) {
      setError('Please select a future date and time.');
      return;
    }

    // Validate time is between 8am and 5pm
    const selectedHour = bookingDateTime.getHours();
    if (selectedHour < 8 || selectedHour >= 17) {
      setError('Booking time must be between 8:00 AM and 5:00 PM.');
      return;
    }

    onConfirm(bookingDateTime.toISOString());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 max-w-md w-full mx-4 rounded-lg border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">Book Service</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-semibold text-white mb-2">{service.title}</h4>
          <p className="text-gray-400 text-sm">{service.description.substring(0, 100)}...</p>
          <p className="text-blue-400 font-bold mt-2">KES {parseFloat(service.price).toLocaleString()}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
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
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Available hours: 8:00 AM - 5:00 PM</p>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-4 pt-4">
              <LoadingButton
                type="submit"
                loading={loading}
                className="flex-1 py-3 px-6"
              >
                Confirm Booking
              </LoadingButton>
              <LoadingButton
                type="button"
                onClick={onClose}
                variant="secondary"
                className="px-6 py-3"
              >
                Cancel
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced Service Card Component
function ServiceCard({ service, onBook }) {
  return (
      <div className="p-6 bg-gray-800 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col border border-gray-700 hover:border-blue-500 rounded-lg">
      <div className="flex-grow">
        <Link to={`/services/${service.id}`} className="block mb-2">
          <h3 className="text-xl font-semibold text-white hover:text-blue-400 transition">
            {service.title}
          </h3>
        </Link>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{service.description}</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">
            {service.category_details?.name || 'Uncategorized'}
          </span>
          <span className="text-gray-500 text-xs">
            {service.provider_details?.first_name} {service.provider_details?.last_name}
          </span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
        <p className="text-2xl font-bold text-blue-400">KES {parseFloat(service.price).toLocaleString()}</p>
        <button
          onClick={() => onBook(service)}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md text-sm transition"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

// Enhanced Booking Card Component
function MyBookingCard({ booking, onCancel, onViewDetails }) {
  const { service_details } = booking;
  const bookingDate = new Date(booking.booking_date);
  
  const statusColors = {
    'PENDING': 'bg-yellow-900 text-yellow-300',
    'CONFIRMED': 'bg-green-900 text-green-300',
    'CANCELED': 'bg-red-900 text-red-300',
    'COMPLETED': 'bg-blue-900 text-blue-300',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="p-5 bg-gray-800 shadow-md hover:shadow-lg transition border border-gray-700 hover:border-blue-500 rounded-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <Link to={`/services/${service_details.id}`} className="flex-1">
          <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition">
            {service_details.title}
          </h3>
        </Link>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-700 text-gray-300'}`}>
          {booking.status}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-300 mb-4">
        <p>
          <span className="font-semibold text-gray-300">Date:</span> {bookingDate.toLocaleDateString()}
        </p>
        <p>
          <span className="font-semibold text-gray-300">Time:</span> {bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p>
          <span className="font-semibold text-gray-300">Provider:</span> {service_details.provider_details?.first_name} {service_details.provider_details?.last_name}
        </p>
        <p>
          <span className="font-semibold text-gray-300">Price:</span> KES {parseFloat(service_details.price).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-2">
        {booking.status !== 'CANCELED' && booking.status !== 'COMPLETED' && (
        <LoadingButton
          onClick={() => onCancel(booking.id)}
          variant="danger"
          className="flex-1 py-2 px-3 text-xs"
        >
          Cancel Booking
        </LoadingButton>
        )}
        <LoadingButton
          onClick={() => onViewDetails(booking)}
          variant="secondary"
          className="py-2 px-3 text-xs"
        >
          View Details
        </LoadingButton>
      </div>
    </motion.div>
  );
}

// Booking Details Modal
function BookingDetailsModal({ booking, isOpen, onClose }) {
  if (!isOpen || !booking) return null;

  const { service_details } = booking;
  const bookingDate = new Date(booking.booking_date);
  
  const statusColors = {
    'PENDING': 'bg-yellow-900 text-yellow-300',
    'CONFIRMED': 'bg-green-900 text-green-300',
    'CANCELED': 'bg-red-900 text-red-300',
    'COMPLETED': 'bg-blue-900 text-blue-300',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto rounded-lg border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">Booking Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Service Information</h4>
            <div className="bg-gray-700 p-4">
              <Link to={`/services/${service_details.id}`} className="block mb-2">
                <h5 className="text-white font-semibold hover:text-blue-400">{service_details.title}</h5>
              </Link>
              <p className="text-gray-300 text-sm mb-2">{service_details.description}</p>
              <p className="text-blue-400 font-bold">KES {parseFloat(service_details.price).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Booking Information</h4>
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <p className="text-gray-300">
                <span className="font-semibold">Status:</span>{' '}
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-600'}`}>
                  {booking.status}
                </span>
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Date:</span> {bookingDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Time:</span> {bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Booked on:</span> {new Date(booking.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-2">Provider Information</h4>
            <div className="bg-gray-700 p-4">
              <p className="text-gray-300">
                <span className="font-semibold">Name:</span> {service_details.provider_details?.first_name} {service_details.provider_details?.last_name}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Email:</span> {service_details.provider_details?.email}
              </p>
            </div>
          </div>

          <LoadingButton
            onClick={onClose}
            className="w-full py-3 px-6"
          >
            Close
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

// Main Seeker Dashboard Component
export default function SeekerDashboard() {
  const { dbUser } = useAuth();
  const { showToast } = useToast();
  const [allServices, setAllServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Modal states
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  
  // Complaints states
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Fetch all data on component mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const [servicesData, bookingsData, categoriesData, complaintsData] = await Promise.all([
          serviceService.getAllServices(),
          bookingService.getMyBookings(),
          categoryService.getCategories(),
          complaintService.getAllComplaints().catch(() => []) // Don't fail if complaints fail
        ]);
        setAllServices(servicesData);
        setMyBookings(bookingsData);
        setCategories(categoriesData);
        setMyComplaints(complaintsData || []);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Load complaints when form is shown or when component becomes visible
  useEffect(() => {
    if (showComplaintForm) {
      const loadComplaints = async () => {
        try {
          setComplaintsLoading(true);
          const complaintsData = await complaintService.getAllComplaints();
          setMyComplaints(complaintsData || []);
        } catch (err) {
          console.error('Failed to load complaints:', err);
        } finally {
          setComplaintsLoading(false);
        }
      };
      loadComplaints();
    }
  }, [showComplaintForm]);

  // Refresh complaints periodically and when page becomes visible
  useEffect(() => {
    const refreshComplaints = async () => {
      try {
        const complaintsData = await complaintService.getAllComplaints();
        setMyComplaints(complaintsData || []);
      } catch (err) {
        console.error('Failed to refresh complaints:', err);
      }
    };

    // Refresh complaints every 30 seconds
    const interval = setInterval(refreshComplaints, 30000);

    // Refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshComplaints();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Filter services with debouncing
  const filteredServices = useMemo(() => {
    return allServices.filter(service => {
      const matchesSearch = debouncedSearchQuery === '' || 
        service.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || 
        service.category === parseInt(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [allServices, debouncedSearchQuery, selectedCategory]);

  // Pagination for services
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  // Sort bookings by date (most recent first)
  const sortedBookings = [...myBookings].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  // Event Handlers
  const handleBookService = (service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (bookingDateTime) => {
    try {
      setBookingLoading(true);
      const newBooking = await bookingService.createBooking({
        service: selectedService.id,
        booking_date: bookingDateTime,
      });
      setMyBookings([newBooking, ...myBookings]);
      setIsBookingModalOpen(false);
      setSelectedService(null);
      showToast('Booking created successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create booking.';
      showToast(errorMessage, 'error');
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBookingClick = (bookingId) => {
    setCancelBookingId(bookingId);
    setIsCancelDialogOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;
    
    try {
      const updatedBooking = await bookingService.updateBooking(cancelBookingId, {
        status: 'CANCELED'
      });
      
      setMyBookings(myBookings.map(b => 
        b.id === cancelBookingId ? updatedBooking : b
      ));
      showToast('Booking canceled successfully.', 'success');
      setIsCancelDialogOpen(false);
      setCancelBookingId(null);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to cancel booking.';
      showToast(errorMessage, 'error');
      console.error(err);
    }
  };

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleComplaintCreated = async (complaintData) => {
    try {
      const newComplaint = await complaintService.createComplaint(complaintData);
      // Refresh all complaints to ensure we have the latest data
      const refreshedComplaints = await complaintService.getAllComplaints().catch(() => myComplaints);
      setMyComplaints(refreshedComplaints);
      showToast('Complaint submitted successfully. We will review it soon.', 'success');
      setShowComplaintForm(false);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || error.message || 'Failed to submit complaint';
      showToast(errorMsg, 'error');
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-900 text-yellow-300';
      case 'IN_REVIEW':
        return 'bg-blue-900 text-blue-300';
      case 'RESOLVED':
        return 'bg-green-900 text-green-300';
      case 'DISMISSED':
        return 'bg-gray-700 text-gray-300';
      default:
        return 'bg-gray-700 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 w-full">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 p-8 shadow-lg rounded-lg border border-gray-700">
          <div className="h-12 bg-gray-700 rounded w-64 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <StatsCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {[1, 2, 3].map(i => <BookingCardSkeleton key={i} />)}
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <ServiceCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-20">
        <p className="text-xl mb-4">{error}</p>
        <LoadingButton
          onClick={() => window.location.reload()}
          className="px-6 py-2"
        >
          Retry
        </LoadingButton>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  // Calculate stats
  const stats = {
    totalBookings: myBookings.length,
    pendingBookings: myBookings.filter(b => b.status === 'PENDING').length,
    confirmedBookings: myBookings.filter(b => b.status === 'CONFIRMED').length,
    completedBookings: myBookings.filter(b => b.status === 'COMPLETED').length,
    totalServices: allServices.length,
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 w-full"
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 p-8 shadow-lg rounded-lg border border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              Welcome back, {(() => {
                const name = dbUser?.first_name || dbUser?.email?.split('@')[0] || 'Seeker';
                return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
              })()}!
              <HandRaisedIcon className="w-8 h-8 text-blue-300" />
            </h1>
            <p className="text-blue-200 text-lg">Manage your bookings and discover new services</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
              <AcademicCapIcon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          { label: 'Total Bookings', value: stats.totalBookings, Icon: CalendarIcon, color: 'text-blue-400', bg: 'bg-blue-900 bg-opacity-20' },
          { label: 'Pending', value: stats.pendingBookings, Icon: ClockIcon, color: 'text-yellow-400', bg: 'bg-yellow-900 bg-opacity-20' },
          { label: 'Confirmed', value: stats.confirmedBookings, Icon: CheckCircleIcon, color: 'text-green-400', bg: 'bg-green-900 bg-opacity-20' },
          { label: 'Completed', value: stats.completedBookings, Icon: SparklesIcon, color: 'text-purple-400', bg: 'bg-purple-900 bg-opacity-20' },
        ].map((stat, index) => {
          const IconComponent = stat.Icon;
          return (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className={`${stat.bg} p-6 border border-gray-700 hover:border-blue-500 transition shadow-lg rounded-lg`}
          >
            <div className="flex items-start justify-between mb-2">
              {(() => {
                const IconComponent = stat.Icon || (() => null);
                return IconComponent ? <IconComponent className={`w-8 h-8 ${stat.color}`} /> : null;
              })()}
              <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
            <p className="text-gray-300 font-medium">{stat.label}</p>
          </motion.div>
          );
        })}
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-gray-800 py-6 px-6 shadow-lg border border-gray-700 rounded-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 text-gray-300 text-sm">
          Showing {filteredServices.length} of {allServices.length} services
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column: My Bookings */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-6 h-6" />
            <span>My Bookings</span>
            <span className="ml-auto px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold">
              {sortedBookings.length}
            </span>
          </h2>
          <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto hide-scrollbar">
            {sortedBookings.length > 0 ? (
              sortedBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MyBookingCard 
                    booking={booking} 
                    onCancel={handleCancelBookingClick}
                    onViewDetails={handleViewBookingDetails}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 bg-gray-800 text-center border border-gray-700 rounded-lg"
              >
                <EnvelopeIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-300 mb-2 font-semibold text-lg">No bookings yet</p>
                <p className="text-gray-300 text-sm">Browse services and book one to get started!</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Available Services */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <WrenchScrewdriverIcon className="w-6 h-6" />
            <span>Available Services</span>
            <span className="ml-auto px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold">
              {filteredServices.length}
            </span>
          </h2>
            {paginatedServices.length > 0 ? (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {paginatedServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ServiceCard 
                        service={service} 
                        onBook={handleBookService} 
                      />
                    </motion.div>
                  ))}
                </motion.div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={filteredServices.length}
                    onItemsPerPageChange={(newItemsPerPage) => {
                      setItemsPerPage(newItemsPerPage);
                      setCurrentPage(1);
                    }}
                  />
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 bg-gray-800 text-center border border-gray-700 rounded-lg"
              >
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-300 text-lg mb-2 font-semibold">No services found</p>
                <p className="text-gray-300 text-sm">Try adjusting your search or filters</p>
              </motion.div>
            )}
        </motion.div>
      </motion.div>

      {/* Complaints Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6" />
            My Complaints
            <span className="ml-2 px-3 py-1 bg-red-600 rounded-full text-sm font-semibold">
              {myComplaints.length}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  const refreshedComplaints = await complaintService.getAllComplaints();
                  setMyComplaints(refreshedComplaints || []);
                  showToast('Complaints refreshed', 'success');
                } catch (err) {
                  console.error('Failed to refresh complaints:', err);
                  showToast('Failed to refresh complaints', 'error');
                }
              }}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition flex items-center gap-2"
              title="Refresh complaints"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <LoadingButton
              onClick={() => setShowComplaintForm(!showComplaintForm)}
              className="px-4 py-2"
            >
              {showComplaintForm ? 'Cancel' : '+ File a Complaint'}
            </LoadingButton>
          </div>
        </div>

        <div className="p-6">
          {showComplaintForm ? (
            <ComplaintForm
              services={allServices}
              bookings={myBookings}
              onComplaintCreated={handleComplaintCreated}
              onClose={() => setShowComplaintForm(false)}
            />
          ) : (
            <div>
              {myComplaints.length > 0 ? (
                <div className="space-y-4">
                  {myComplaints.map((complaint) => (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {complaint.complaint_type.replace('_', ' ')}
                            </span>
                            {complaint.service_details && (
                              <span className="text-gray-400 text-sm">
                                • {complaint.service_details.title}
                              </span>
                            )}
                          </div>
                          <p className="text-white mb-2">{complaint.description}</p>
                          {complaint.admin_response && (
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <p className="text-sm font-semibold text-blue-400 mb-1">Admin Response:</p>
                              <p className="text-gray-300 text-sm">{complaint.admin_response}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-gray-400 text-xs">
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </p>
                          {complaint.status === 'RESOLVED' && complaint.resolved_at && (
                            <p className="text-gray-400 text-xs mt-1">
                              Resolved: {new Date(complaint.resolved_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-300 mb-2 font-semibold text-lg">No complaints yet</p>
                  <p className="text-gray-400 text-sm mb-4">
                    If you encounter any issues, feel free to file a complaint
                  </p>
                  <LoadingButton
                    onClick={() => setShowComplaintForm(true)}
                    className="px-6 py-2"
                  >
                    File a Complaint
                  </LoadingButton>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          isOpen={isBookingModalOpen}
          loading={bookingLoading}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedService(null);
          }}
          onConfirm={handleConfirmBooking}
        />
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedBooking(null);
        }}
      />

      {/* Cancel Booking Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isCancelDialogOpen}
        onClose={() => {
          setIsCancelDialogOpen(false);
          setCancelBookingId(null);
        }}
        onConfirm={handleCancelBooking}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        variant="danger"
      />
    </motion.div>
  );
}
