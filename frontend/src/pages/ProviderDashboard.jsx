import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HandRaisedIcon, 
  WrenchScrewdriverIcon, 
  CalendarIcon, 
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { serviceService } from '../services/serviceService';
import { categoryService } from '../services/categoryService';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ServiceCardSkeleton, BookingCardSkeleton, StatsCardSkeleton } from '../components/LoadingSkeleton';

// Create Service Form Component
function CreateServiceForm({ categories, onServiceCreated, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const newService = await serviceService.createService(formData);
      onServiceCreated(newService);
      setFormData({ title: '', description: '', price: '', category: '' });
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create service.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500";
  const labelStyle = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">Create New Service</h3>
      
      <div>
        <label htmlFor="title" className={labelStyle}>Service Title</label>
        <input 
          type="text" 
          name="title" 
          value={formData.title} 
          onChange={handleChange} 
          className={inputStyle} 
          required 
        />
      </div>
      
      <div>
        <label htmlFor="description" className={labelStyle}>Description</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          rows="4"
          className={inputStyle} 
          required 
        />
      </div>
      
      <div>
        <label htmlFor="price" className={labelStyle}>Price (KES)</label>
        <input 
          type="number" 
          name="price" 
          value={formData.price} 
          onChange={handleChange} 
          min="0"
          step="0.01"
          className={inputStyle} 
          required 
        />
      </div>
      
      <div>
        <label htmlFor="category" className={labelStyle}>Category</label>
        <select 
          name="category" 
          value={formData.category} 
          onChange={handleChange} 
          className={inputStyle} 
          required
        >
          <option value="" disabled>Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="flex gap-2">
        <LoadingButton 
          type="submit" 
          loading={loading}
          className="flex-1 py-2 px-4"
        >
          Create Service
        </LoadingButton>
        {onClose && (
          <LoadingButton 
            type="button"
            onClick={onClose}
            variant="secondary"
            className="px-4 py-2"
          >
            Cancel
          </LoadingButton>
        )}
      </div>
    </form>
  );
}

// Edit Service Modal
function EditServiceModal({ service, categories, isOpen, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    description: service?.description || '',
    price: service?.price || '',
    category: service?.category || '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        description: service.description,
        price: service.price,
        category: service.category,
      });
    }
  }, [service]);

  if (!isOpen || !service) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const updatedService = await serviceService.updateService(service.id, formData);
      onUpdated(updatedService);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update service.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500";
  const labelStyle = "block text-sm font-medium text-gray-300 mb-2";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto rounded-lg border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">Edit Service</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className={labelStyle}>Service Title</label>
            <input 
              id="edit-title"
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className={inputStyle} 
              required 
            />
          </div>
          
          <div>
            <label htmlFor="edit-description" className={labelStyle}>Description</label>
            <textarea 
              id="edit-description"
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="6"
              className={inputStyle} 
              required 
            />
          </div>
          
          <div>
            <label htmlFor="edit-price" className={labelStyle}>Price (KES)</label>
            <input 
              id="edit-price"
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              min="0"
              step="0.01"
              className={inputStyle} 
              required 
            />
          </div>
          
          <div>
            <label htmlFor="edit-category" className={labelStyle}>Category</label>
            <select 
              id="edit-category"
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className={inputStyle} 
              required
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex gap-4 pt-4">
            <LoadingButton 
              type="submit" 
              loading={loading}
              className="flex-1 py-3 px-6"
            >
              Update Service
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
        </form>
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, onEdit, onDelete }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="p-6 bg-gray-800 shadow-md hover:shadow-xl transition border border-gray-700 hover:border-blue-500 rounded-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">{service.title}</h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{service.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-gray-700 px-2 py-1 rounded text-gray-300">
              {service.category_details?.name || 'Uncategorized'}
            </span>
            <span className="text-2xl font-bold text-blue-400">
              KES {parseFloat(service.price).toLocaleString()}
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Created: {new Date(service.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
        <LoadingButton
          onClick={() => onEdit(service)}
          className="flex-1 py-2 px-4 text-sm"
        >
          Edit
        </LoadingButton>
        <LoadingButton
          onClick={() => onDelete(service.id)}
          variant="danger"
          className="flex-1 py-2 px-4 text-sm"
        >
          Delete
        </LoadingButton>
      </div>
    </motion.div>
  );
}

// Booking Card Component
function BookingCard({ booking, onUpdateStatus }) {
  const bookingDate = new Date(booking.booking_date);
  const statusColors = {
    'PENDING': 'bg-yellow-900 text-yellow-300',
    'CONFIRMED': 'bg-green-900 text-green-300',
    'CANCELED': 'bg-red-900 text-red-300',
    'COMPLETED': 'bg-blue-900 text-blue-300',
  };

  const canConfirm = booking.status === 'PENDING';
  const canComplete = booking.status === 'CONFIRMED';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="p-5 bg-gray-800 shadow-md border border-gray-700 hover:border-blue-500 rounded-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white">{booking.service_details.title}</h4>
          <p className="text-gray-400 text-sm mt-1">
            Client: {booking.seeker_details?.first_name} {booking.seeker_details?.last_name}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[booking.status] || 'bg-gray-700'}`}>
          {booking.status}
        </span>
      </div>
      
      <div className="space-y-1 text-sm text-gray-300 mb-4">
        <p><span className="font-semibold text-gray-300">Date:</span> {bookingDate.toLocaleDateString()}</p>
        <p><span className="font-semibold text-gray-300">Time:</span> {bookingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p><span className="font-semibold text-gray-300">Booked on:</span> {new Date(booking.created_at).toLocaleDateString()}</p>
      </div>

      {canConfirm && (
        <LoadingButton
          onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}
          variant="success"
          className="w-full py-2 px-4 text-sm mb-2"
        >
          Confirm Booking
        </LoadingButton>
      )}
      
      {canComplete && (
        <LoadingButton
          onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}
          className="w-full py-2 px-4 text-sm"
        >
          Mark as Completed
        </LoadingButton>
      )}
    </motion.div>
  );
}

// Main Provider Dashboard Component
export default function ProviderDashboard() {
  const { dbUser } = useAuth();
  const { showToast } = useToast();
  const [myServices, setMyServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Category management states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('services'); // 'services' or 'categories'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [servicesData, bookingsData, categoriesData] = await Promise.all([
          serviceService.getMyServices(),
          bookingService.getMyBookings(),
          categoryService.getCategories(),
        ]);
        setMyServices(servicesData);
        setMyBookings(bookingsData);
        setCategories(categoriesData);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleServiceCreated = (newService) => {
    setMyServices([newService, ...myServices]);
    setShowCreateModal(false);
  };

  const handleServiceUpdated = (updatedService) => {
    setMyServices(myServices.map(s => 
      s.id === updatedService.id ? updatedService : s
    ));
    setEditingService(null);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setCategoryLoading(true);
    try {
      if (editingCategory) {
        const updated = await categoryService.updateCategory(editingCategory.id, categoryFormData);
        setCategories(categories.map(cat => cat.id === updated.id ? updated : cat));
        showToast('Category updated successfully', 'success');
      } else {
        const newCategory = await categoryService.createCategory(categoryFormData);
        setCategories([...categories, newCategory]);
        showToast('Category created successfully', 'success');
      }
      setCategoryFormData({ name: '' });
      setShowCategoryForm(false);
      setEditingCategory(null);
    } catch (err) {
      const errorMsg = err.response?.data?.name?.[0] || err.response?.data?.detail || err.message || 'Failed to save category';
      showToast(errorMsg, 'error');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({ name: category.name });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    
    setCategoryLoading(true);
    try {
      await categoryService.deleteCategory(deleteCategoryId);
      setCategories(categories.filter(cat => cat.id !== deleteCategoryId));
      showToast('Category deleted successfully', 'success');
      setDeleteCategoryId(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete category';
      showToast(errorMsg, 'error');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteServiceClick = (serviceId) => {
    setServiceToDelete(serviceId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      await serviceService.deleteService(serviceToDelete);
      setMyServices(myServices.filter(s => s.id !== serviceToDelete));
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
      showToast('Service deleted successfully.', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete service.';
      showToast(errorMessage, 'error');
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const updatedBooking = await bookingService.updateBooking(bookingId, {
        status: newStatus
      });
      setMyBookings(myBookings.map(b => 
        b.id === bookingId ? updatedBooking : b
      ));
      showToast(`Booking ${newStatus.toLowerCase()} successfully.`, 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update booking status.';
      showToast(errorMessage, 'error');
      console.error(err);
    }
  };

  // Calculate stats
  const stats = {
    totalServices: myServices.length,
    totalBookings: myBookings.length,
    pendingBookings: myBookings.filter(b => b.status === 'PENDING').length,
    confirmedBookings: myBookings.filter(b => b.status === 'CONFIRMED').length,
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
            <ServiceCardSkeleton />
          </div>
          <div className="lg:col-span-1 space-y-4">
            {[1, 2, 3].map(i => <ServiceCardSkeleton key={i} />)}
          </div>
          <div className="lg:col-span-1 space-y-4">
            {[1, 2, 3].map(i => <BookingCardSkeleton key={i} />)}
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

  // Sort bookings by date (most recent first)
  const sortedBookings = [...myBookings].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 w-full h-full overflow-hidden"
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 p-8 shadow-lg border border-gray-700 rounded-lg"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              Welcome back, {(() => {
                const name = dbUser?.first_name || dbUser?.email?.split('@')[0] || 'Provider';
                return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
              })()}!
              <HandRaisedIcon className="w-8 h-8 text-blue-300" />
            </h1>
            <p className="text-blue-200 text-lg">Manage your services and track your bookings</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
              <WrenchScrewdriverIcon className="w-10 h-10 text-white" />
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
          { label: 'Total Services', value: stats.totalServices, Icon: WrenchScrewdriverIcon, color: 'text-blue-400', bg: 'bg-blue-900 bg-opacity-20' },
          { label: 'Total Bookings', value: stats.totalBookings, Icon: CalendarIcon, color: 'text-purple-400', bg: 'bg-purple-900 bg-opacity-20' },
          { label: 'Pending', value: stats.pendingBookings, Icon: ClockIcon, color: 'text-yellow-400', bg: 'bg-yellow-900 bg-opacity-20' },
          { label: 'Confirmed', value: stats.confirmedBookings, Icon: CheckCircleIcon, color: 'text-green-400', bg: 'bg-green-900 bg-opacity-20' },
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
                <IconComponent className={`w-8 h-8 ${stat.color}`} />
                <span className={`text-3xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
              <p className="text-gray-300 font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Tabs for Services and Categories */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl flex flex-col h-full">
        <div className="border-b border-gray-700 flex-shrink-0">
          <nav className="flex -mb-px space-x-1">
            {[
              { id: 'services', label: 'Services', Icon: Cog6ToothIcon },
              { id: 'categories', label: 'Categories', Icon: FolderIcon }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  console.log('Switching to section:', section.id);
                  setActiveSection(section.id);
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
                className={`px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeSection === section.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
                style={{ minWidth: '120px' }}
              >
                <section.Icon className="w-5 h-5" />
                <span className="font-semibold">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 flex-1 overflow-y-auto min-h-0 hide-scrollbar">
          {/* Services Section */}
          {activeSection === 'services' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
            >
              {/* Left Column: Create Service */}
              <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col">
                <div className="bg-gray-800 p-6 shadow-md border border-gray-700 rounded-lg h-full flex flex-col">
                  {!showCreateModal ? (
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Cog6ToothIcon className="w-6 h-6" />
                        Your Services
                      </h2>
                      <LoadingButton
                        onClick={() => setShowCreateModal(true)}
                        className="w-full py-3 px-4"
                      >
                        + Create New Service
                      </LoadingButton>
                    </div>
                  ) : (
                    <CreateServiceForm
                      categories={categories}
                      onServiceCreated={handleServiceCreated}
                      onClose={() => setShowCreateModal(false)}
                    />
                  )}
                </div>
              </motion.div>

        {/* Middle Column: My Services List */}
        <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col">
          <div className="bg-gray-800 p-6 border border-gray-700 shadow-lg rounded-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 flex-shrink-0">
              <ClipboardDocumentListIcon className="w-6 h-6" />
              <span>My Services</span>
              <span className="ml-auto px-2 py-1 bg-blue-600 rounded-full text-xs font-semibold">
                {myServices.length}
              </span>
            </h2>
            <div className="space-y-4 flex-1 overflow-y-auto hide-scrollbar">
              {myServices.length > 0 ? (
                myServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ServiceCard
                      service={service}
                      onEdit={setEditingService}
                      onDelete={handleDeleteServiceClick}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 bg-gray-700 text-center border-2 border-dashed border-gray-600 rounded-lg"
                >
                  <WrenchScrewdriverIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-300 mb-2 font-semibold text-lg">No services yet</p>
                  <p className="text-gray-300 text-sm">Click "Create New Service" to get started!</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

              {/* Right Column: Bookings */}
              <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col">
                <div className="bg-gray-800 p-6 border border-gray-700 shadow-lg rounded-lg h-full flex flex-col">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 flex-shrink-0">
                    <CalendarIcon className="w-6 h-6" />
                    <span>Bookings</span>
                    <span className="ml-auto px-2 py-1 bg-blue-600 rounded-full text-xs font-semibold">
                      {sortedBookings.length}
                    </span>
                  </h2>
            <div className="space-y-4 flex-1 overflow-y-auto hide-scrollbar">
              {sortedBookings.length > 0 ? (
                sortedBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <BookingCard
                      booking={booking}
                      onUpdateStatus={handleUpdateBookingStatus}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 bg-gray-700 text-center border-2 border-dashed border-gray-600 rounded-lg"
                >
                  <EnvelopeIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-300 mb-2 font-semibold text-lg">No bookings yet</p>
                  <p className="text-gray-300 text-sm">Bookings will appear here when clients book your services.</p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
            </motion.div>
          )}

          {/* Categories Section */}
          {activeSection === 'categories' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Category Management</h2>
                {!showCategoryForm && (
                  <LoadingButton
                    onClick={() => {
                      setShowCategoryForm(true);
                      setEditingCategory(null);
                      setCategoryFormData({ name: '' });
                    }}
                    className="px-4 py-2"
                  >
                    + Add Category
                  </LoadingButton>
                )}
              </div>

              {/* Category Form */}
              {showCategoryForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 p-6 rounded-lg mb-6 border border-gray-600"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-2">
                        Category Name
                      </label>
                      <input
                        type="text"
                        id="categoryName"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        placeholder="e.g., Plumbing, Electrical, Carpentry"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton
                        type="submit"
                        loading={categoryLoading}
                        className="px-4 py-2"
                      >
                        {editingCategory ? 'Update' : 'Create'}
                      </LoadingButton>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCategoryForm(false);
                          setEditingCategory(null);
                          setCategoryFormData({ name: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Categories Table */}
              <div className="overflow-x-auto max-h-[calc(100vh-450px)] overflow-y-auto hide-scrollbar">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Slug</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Services Count</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                          No categories found. Create your first category!
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => {
                        const serviceCount = myServices.filter(s => s.category === category.id).length;
                        return (
                          <tr key={category.id} className="hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              <span className="font-semibold text-white">{category.name}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              <span className="text-gray-400 text-sm">{category.slug}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                                {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                                  disabled={categoryLoading}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteCategoryId(category.id)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                                  disabled={categoryLoading || serviceCount > 0}
                                  title={serviceCount > 0 ? 'Cannot delete category with services' : 'Delete category'}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <EditServiceModal
          service={editingService}
          categories={categories}
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          onUpdated={handleServiceUpdated}
        />
      )}

      {/* Delete Service Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleDeleteService}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Category Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteCategoryId}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete this category? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
}
