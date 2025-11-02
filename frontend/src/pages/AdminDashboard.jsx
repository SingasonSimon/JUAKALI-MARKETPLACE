import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  FolderIcon,
  StarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../services/adminService';
import { djangoAdminService } from '../services/djangoAdminService';
import { serviceService } from '../services/serviceService';
import { bookingService } from '../services/bookingService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import ConfirmationDialog from '../components/ConfirmationDialog';
import FormInput from '../components/FormInput';

export default function AdminDashboard({ djangoAdminUser: propDjangoAdminUser = null }) {
  const { dbUser: firebaseDbUser } = useAuth();
  const { showToast } = useToast();
  
  // Try to get djangoAdminUser from outlet context, fallback to prop
  let outletContext = null;
  try {
    outletContext = useOutletContext();
  } catch (e) {
    // Not in outlet context, use prop
  }
  
  const djangoAdminUser = outletContext?.djangoAdminUser || propDjangoAdminUser;
  
  // Use Django admin user if provided, otherwise use Firebase user
  const dbUser = djangoAdminUser || firebaseDbUser;
  const isDjangoAdmin = !!djangoAdminUser;
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState(null);
  const [actionLogs, setActionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [userFormData, setUserFormData] = useState({ role: '', first_name: '', last_name: '' });
  const [deleteServiceId, setDeleteServiceId] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({ title: '', description: '', price: '', category: '' });
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [complaintFormData, setComplaintFormData] = useState({ status: '', admin_response: '' });
  const [reportType, setReportType] = useState('user_activity');
  const [editingBooking, setEditingBooking] = useState(null);
  const [deleteBookingId, setDeleteBookingId] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({ status: '' });
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({ rating: '', comment: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use djangoAdminService if accessed via Django admin, otherwise use regular adminService
        const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
        
        // Fetch all data in parallel
        const categoryApi = isDjangoAdmin ? djangoAdminService : categoryService;
        const [usersData, servicesData, categoriesData, bookingsData, complaintsData, analyticsData] = await Promise.all([
          adminApi.getAllUsers(),
          serviceService.getAllServices(),
          categoryApi.getCategories(),
          adminApi.getAllBookings().catch(() => []),
          adminApi.getAllComplaints().catch(() => []),
          adminApi.getAnalytics().catch(() => null)
        ]);
        setUsers(usersData);
        setServices(servicesData);
        setCategories(categoriesData);
        setBookings(bookingsData);
        setComplaints(complaintsData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError("Failed to load admin data. You may not have permission.");
        console.error(err);
        showToast('Failed to load admin data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showToast, isDjangoAdmin]);

  useEffect(() => {
    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    
    if (activeTab === 'analytics' && !analytics) {
      adminApi.getAnalytics().then(setAnalytics).catch(console.error);
    } else if (activeTab === 'reports') {
      adminApi.getReports(reportType).then(setReports).catch(console.error);
    } else if (activeTab === 'audit-logs') {
      adminApi.getActionLogs().then(setActionLogs).catch(console.error);
    } else if (activeTab === 'reviews' && reviews.length === 0) {
      adminApi.getAllReviews().then(setReviews).catch(() => setReviews([]));
    } else if (activeTab === 'complaints') {
      // Refresh complaints when complaints tab is active
      adminApi.getAllComplaints().then(setComplaints).catch(() => setComplaints([]));
    }
  }, [activeTab, reportType, isDjangoAdmin]);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setCategoryLoading(true);
    const categoryApi = isDjangoAdmin ? djangoAdminService : categoryService;
    try {
      if (editingCategory) {
        // Update existing category
        const updated = await categoryApi.updateCategory(editingCategory.id, categoryFormData);
        setCategories(categories.map(cat => cat.id === updated.id ? updated : cat));
        showToast('Category updated successfully', 'success');
      } else {
        // Create new category
        const newCategory = await categoryApi.createCategory(categoryFormData);
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
    const categoryApi = isDjangoAdmin ? djangoAdminService : categoryService;
    try {
      await categoryApi.deleteCategory(deleteCategoryId);
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

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      role: user.role,
      first_name: user.first_name || '',
      last_name: user.last_name || ''
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      const updated = await adminApi.updateUser(editingUser.id, userFormData);
      setUsers(users.map(u => u.id === updated.id ? updated : u));
      showToast('User updated successfully', 'success');
      setEditingUser(null);
      setUserFormData({ role: '', first_name: '', last_name: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update user';
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      await adminApi.deleteUser(deleteUserId);
      setUsers(users.filter(u => u.id !== deleteUserId));
      showToast('User deleted successfully', 'success');
      setDeleteUserId(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete user';
      showToast(errorMsg, 'error');
    }
  };

  const handleActivateUser = async (userId) => {
    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      const updated = await adminApi.activateUser(userId);
      setUsers(users.map(u => u.id === updated.id ? updated : u));
      showToast(`User ${updated.is_active ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update user status';
      showToast(errorMsg, 'error');
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceFormData({
      title: service.title || '',
      description: service.description || '',
      price: service.price || '',
      category: service.category || ''
    });
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!editingService) return;

    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      const updated = await adminApi.updateService(editingService.id, serviceFormData);
      setServices(services.map(s => s.id === updated.id ? updated : s));
      showToast('Service updated successfully', 'success');
      setEditingService(null);
      setServiceFormData({ title: '', description: '', price: '', category: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update service';
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteService = async () => {
    if (!deleteServiceId) return;
    
    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      await adminApi.deleteService(deleteServiceId);
      setServices(services.filter(s => s.id !== deleteServiceId));
      showToast('Service deleted successfully', 'success');
      setDeleteServiceId(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete service';
      showToast(errorMsg, 'error');
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;

    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      const updated = await adminApi.updateComplaint(editingComplaint.id, complaintFormData);
      // Refresh all complaints to ensure we have the latest data
      const refreshedComplaints = await adminApi.getAllComplaints().catch(() => complaints);
      setComplaints(refreshedComplaints);
      showToast('Complaint updated successfully', 'success');
      setEditingComplaint(null);
      setComplaintFormData({ status: '', admin_response: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update complaint';
      showToast(errorMsg, 'error');
    }
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setBookingFormData({ status: booking.status });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;

    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      const updated = await adminApi.updateBooking(editingBooking.id, bookingFormData);
      setBookings(bookings.map(b => b.id === updated.id ? updated : b));
      showToast('Booking updated successfully', 'success');
      setEditingBooking(null);
      setBookingFormData({ status: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update booking';
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteBooking = async () => {
    if (!deleteBookingId) return;
    
    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      await adminApi.deleteBooking(deleteBookingId);
      setBookings(bookings.filter(b => b.id !== deleteBookingId));
      showToast('Booking deleted successfully', 'success');
      setDeleteBookingId(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete booking';
      showToast(errorMsg, 'error');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewFormData({ rating: review.rating.toString(), comment: review.comment || '' });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!editingReview) return;

    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      const updated = await adminApi.updateReview(editingReview.id, {
        rating: parseInt(reviewFormData.rating),
        comment: reviewFormData.comment
      });
      setReviews(reviews.map(r => r.id === updated.id ? updated : r));
      showToast('Review updated successfully', 'success');
      setEditingReview(null);
      setReviewFormData({ rating: '', comment: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update review';
      showToast(errorMsg, 'error');
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    
    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
    try {
      await adminApi.deleteReview(deleteReviewId);
      setReviews(reviews.filter(r => r.id !== deleteReviewId));
      showToast('Review deleted successfully', 'success');
      setDeleteReviewId(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete review';
      showToast(errorMsg, 'error');
    }
  };

  const handleExportReports = () => {
    if (!reports || !reports.data || reports.data.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    try {
      // Define column mappings based on report type
      let keyMapping = {};
      let headers = [];
      
      if (reportType === 'user_activity') {
        keyMapping = {
          email: 'Email',
          name: 'Name', // Combined first_name + last_name
          role: 'Role',
          date_joined: 'Joined'
        };
        headers = ['Email', 'Name', 'Role', 'Joined'];
      } else if (reportType === 'service_performance') {
        keyMapping = {
          title: 'Service',
          provider__email: 'Provider Email',
          category__name: 'Category',
          price: 'Price',
          booking_count: 'Bookings',
          review_count: 'Reviews',
          avg_rating: 'Avg Rating'
        };
        headers = ['Service', 'Provider Email', 'Category', 'Price', 'Bookings', 'Reviews', 'Avg Rating'];
      } else if (reportType === 'booking_analytics') {
        keyMapping = {
          date: 'Date',
          count: 'Total',
          confirmed: 'Confirmed',
          completed: 'Completed',
          canceled: 'Canceled'
        };
        headers = ['Date', 'Total', 'Confirmed', 'Completed', 'Canceled'];
      }

      // Convert data to CSV format
      const csvRows = [];
      
      // Add headers
      csvRows.push(headers.join(','));

      // Helper function to escape CSV values
      const escapeCsvValue = (value) => {
        const stringValue = value?.toString() || '';
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Add data rows
      reports.data.forEach((item) => {
        const values = headers.map(header => {
          // Find the key that maps to this header
          const key = Object.keys(keyMapping).find(k => keyMapping[k] === header);
          if (key) {
            let value;
            // Special handling for combined name field
            if (key === 'name' && reportType === 'user_activity') {
              const firstName = item.first_name || '';
              const lastName = item.last_name || '';
              value = `${firstName} ${lastName}`.trim() || 'N/A';
            } else {
              value = item[key];
            }
            
            // Format specific values
            if (key === 'date_joined' && value) {
              value = new Date(value).toLocaleString();
            } else if (key === 'price' && value !== null && value !== undefined) {
              value = `$${parseFloat(value).toFixed(2)}`;
            } else if (key === 'avg_rating' && value !== null && value !== undefined) {
              value = parseFloat(value).toFixed(2);
            } else if (key === 'date' && value) {
              value = new Date(value).toLocaleDateString();
            }
            return escapeCsvValue(value);
          }
          return '';
        });
        csvRows.push(values.join(','));
      });

      // Create CSV content
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const reportTypeName = reportType.replace('_', '-');
      link.download = `juakali-${reportTypeName}-report-${timestamp}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Report exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting report:', error);
      showToast('Failed to export report', 'error');
    }
  };

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    providers: users.filter(u => u.role === 'PROVIDER').length,
    seekers: users.filter(u => u.role === 'SEEKER').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    totalServices: services.length,
    totalBookings: bookings.length,
  };

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

  if (loading) {
    return (
      <div className="text-center text-white py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4">Loading admin dashboard...</p>
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

  const thStyle = "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider";
  const tdStyle = "px-6 py-4 whitespace-nowrap text-sm text-gray-200 text-left";

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
              Admin Dashboard
              <BriefcaseIcon className="w-8 h-8 text-blue-300" />
            </h1>
            <p className="text-blue-200 text-lg">Manage users, services, and platform settings</p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
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
          { label: 'Total Users', value: stats.totalUsers, Icon: UserIcon, color: 'text-blue-400', bg: 'bg-blue-900 bg-opacity-20' },
          { label: 'Active Users', value: stats.activeUsers, Icon: CheckCircleIcon, color: 'text-green-400', bg: 'bg-green-900 bg-opacity-20' },
          { label: 'Providers', value: stats.providers, Icon: WrenchScrewdriverIcon, color: 'text-purple-400', bg: 'bg-purple-900 bg-opacity-20' },
          { label: 'Service Seekers', value: stats.seekers, Icon: MagnifyingGlassIcon, color: 'text-yellow-400', bg: 'bg-yellow-900 bg-opacity-20' },
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

      {/* Additional Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { label: 'Total Services', value: stats.totalServices, Icon: ClipboardDocumentListIcon, color: 'text-blue-400', bg: 'bg-blue-900 bg-opacity-20' },
          { label: 'Total Bookings', value: stats.totalBookings, Icon: CalendarIcon, color: 'text-green-400', bg: 'bg-green-900 bg-opacity-20' },
          { label: 'Admins', value: stats.admins, Icon: BriefcaseIcon, color: 'text-red-400', bg: 'bg-red-900 bg-opacity-20' },
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

      {/* Tabs */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl flex flex-col h-full">
        <div className="border-b border-gray-700 flex-shrink-0">
          <nav className="flex -mb-px space-x-1">
            {[
              { id: 'overview', label: 'Overview', Icon: ClipboardDocumentListIcon },
              { id: 'users', label: 'Users', Icon: UserIcon },
              { id: 'services', label: 'Services', Icon: Cog6ToothIcon },
              { id: 'bookings', label: 'Bookings', Icon: CalendarIcon },
              { id: 'categories', label: 'Categories', Icon: FolderIcon },
              { id: 'complaints', label: 'Complaints', Icon: ExclamationTriangleIcon },
              { id: 'reviews', label: 'Reviews', Icon: StarIcon },
              { id: 'analytics', label: 'Analytics', Icon: ChartBarIcon },
              { id: 'reports', label: 'Reports', Icon: DocumentTextIcon },
              { id: 'audit-logs', label: 'Audit Logs', Icon: ClockIcon },
            ].map((tab) => {
              const IconComponent = tab.Icon;
              return (
                <button
                  key={tab.id}
                    onClick={() => {
                    setActiveTab(tab.id);
                    setShowCategoryForm(false);
                    setEditingCategory(null);
                    setEditingUser(null);
                    setEditingComplaint(null);
                    setEditingBooking(null);
                    setEditingReview(null);
                    setEditingService(null);
                  }}
                  className={`px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                  style={{ minWidth: '120px' }}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 flex-1 overflow-y-auto min-h-0 hide-scrollbar">
          {/* Users Table */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <UserIcon className="w-6 h-6" />
                User Management
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className={thStyle}>Name</th>
                      <th scope="col" className={thStyle}>Email</th>
                      <th scope="col" className={thStyle}>Role</th>
                      <th scope="col" className={thStyle}>Status</th>
                      <th scope="col" className={thStyle}>Created</th>
                      <th scope="col" className={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-700 transition-colors">
                          <td className={tdStyle}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {user.first_name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <span>{user.first_name} {user.last_name}</span>
                            </div>
                          </td>
                          <td className={tdStyle}>{user.email}</td>
                          <td className={tdStyle}>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              user.role === 'ADMIN' ? 'bg-red-900 text-red-300' :
                              user.role === 'PROVIDER' ? 'bg-blue-900 text-blue-300' :
                              'bg-green-900 text-green-300'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className={tdStyle}>
                            {user.is_active ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-800 text-green-100">Active</span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-800 text-red-100">Inactive</span>
                            )}
                          </td>
                          <td className={tdStyle}>
                            {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className={tdStyle}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-blue-400 hover:text-blue-300 transition"
                                title="Edit user"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleActivateUser(user.id)}
                                className={`p-2 transition ${
                                  user.is_active 
                                    ? 'text-yellow-400 hover:text-yellow-300' 
                                    : 'text-green-400 hover:text-green-300'
                                }`}
                                title={user.is_active ? 'Deactivate' : 'Activate'}
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteUserId(user.id)}
                                className="p-2 text-red-400 hover:text-red-300 transition"
                                title="Delete user"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* User Edit Form */}
              {editingUser && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 p-6 rounded-lg mt-6 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Edit User</h3>
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setUserFormData({ role: '', first_name: '', last_name: '' });
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleUserSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                        <input
                          type="text"
                          value={userFormData.first_name}
                          onChange={(e) => setUserFormData({ ...userFormData, first_name: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={userFormData.last_name}
                          onChange={(e) => setUserFormData({ ...userFormData, last_name: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                      <select
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      >
                        <option value="SEEKER">Seeker</option>
                        <option value="PROVIDER">Provider</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton type="submit" className="px-4 py-2">Update User</LoadingButton>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(null);
                          setUserFormData({ role: '', first_name: '', last_name: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Services Table */}
          {activeTab === 'services' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-6 h-6" />
                Service Management
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className={thStyle}>Service Title</th>
                      <th scope="col" className={thStyle}>Provider</th>
                      <th scope="col" className={thStyle}>Category</th>
                      <th scope="col" className={thStyle}>Price (KES)</th>
                      <th scope="col" className={thStyle}>Created</th>
                      <th scope="col" className={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {services.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                          No services found
                        </td>
                      </tr>
                    ) : (
                      services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-700 transition-colors">
                          <td className={tdStyle}>
                            <div className="font-semibold">{service.title}</div>
                            <div className="text-gray-400 text-xs mt-1 line-clamp-1">{service.description}</div>
                          </td>
                          <td className={tdStyle}>
                            {service.provider_details?.email || 'N/A'}
                          </td>
                          <td className={tdStyle}>
                            <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                              {service.category_details?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className={tdStyle}>
                            <span className="text-blue-400 font-bold">
                              KES {parseFloat(service.price || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className={tdStyle}>
                            {service.created_at ? new Date(service.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className={tdStyle}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditService(service)}
                                className="p-2 text-blue-400 hover:text-blue-300 transition"
                                title="Edit service"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteServiceId(service.id)}
                                className="p-2 text-red-400 hover:text-red-300 transition"
                                title="Delete service"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Service Edit Form */}
              {editingService && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 p-6 rounded-lg mt-6 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Edit Service</h3>
                    <button
                      onClick={() => {
                        setEditingService(null);
                        setServiceFormData({ title: '', description: '', price: '', category: '' });
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleServiceSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <input
                          type="text"
                          value={serviceFormData.title}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Price (KES)</label>
                        <input
                          type="number"
                          value={serviceFormData.price}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                      <textarea
                        value={serviceFormData.description}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                      <select
                        value={serviceFormData.category}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, category: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton type="submit" className="px-4 py-2">Update Service</LoadingButton>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingService(null);
                          setServiceFormData({ title: '', description: '', price: '', category: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <motion.div
              id="categories-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FolderIcon className="w-6 h-6" />
                  Category Management
                </h2>
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className={thStyle}>Name</th>
                      <th scope="col" className={thStyle}>Slug</th>
                      <th scope="col" className={thStyle}>Services Count</th>
                      <th scope="col" className={thStyle}>Actions</th>
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
                        const serviceCount = services.filter(s => s.category === category.id).length;
                        return (
                          <tr key={category.id} className="hover:bg-gray-700 transition-colors">
                            <td className={tdStyle}>
                              <span className="font-semibold text-white">{category.name}</span>
                            </td>
                            <td className={tdStyle}>
                              <span className="text-gray-400 text-sm">{category.slug}</span>
                            </td>
                            <td className={tdStyle}>
                              <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                                {serviceCount} {serviceCount === 1 ? 'service' : 'services'}
                              </span>
                            </td>
                            <td className={tdStyle}>
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

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-6 h-6" />
                Platform Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Recent Users
                  </h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.first_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.role === 'ADMIN' ? 'bg-red-900 text-red-300' :
                          user.role === 'PROVIDER' ? 'bg-blue-900 text-blue-300' :
                          'bg-green-900 text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </motion.div>
                    ))}
                    {users.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No users yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Recent Services */}
                <motion.div
                  variants={itemVariants}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <WrenchScrewdriverIcon className="w-5 h-5" />
                    Recent Services
                  </h3>
                  <div className="space-y-3">
                    {services.slice(0, 5).map((service) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <p className="text-white text-sm font-medium mb-1">{service.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">
                            {service.category_details?.name || 'Uncategorized'}
                          </span>
                          <span className="text-blue-400 font-bold text-sm">
                            KES {parseFloat(service.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    {services.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <WrenchScrewdriverIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No services yet</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                All Bookings
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className={thStyle}>Service</th>
                      <th scope="col" className={thStyle}>Seeker</th>
                      <th scope="col" className={thStyle}>Status</th>
                      <th scope="col" className={thStyle}>Booking Date</th>
                      <th scope="col" className={thStyle}>Created</th>
                      <th scope="col" className={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-700 transition-colors">
                          <td className={tdStyle}>{booking.service_details?.title || 'N/A'}</td>
                          <td className={tdStyle}>
                            {booking.seeker_details?.email || 'N/A'}
                          </td>
                          <td className={tdStyle}>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              booking.status === 'CONFIRMED' ? 'bg-green-900 text-green-300' :
                              booking.status === 'COMPLETED' ? 'bg-blue-900 text-blue-300' :
                              booking.status === 'CANCELED' ? 'bg-red-900 text-red-300' :
                              'bg-yellow-900 text-yellow-300'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className={tdStyle}>
                            {booking.booking_date ? new Date(booking.booking_date).toLocaleString() : 'N/A'}
                          </td>
                          <td className={tdStyle}>
                            {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className={tdStyle}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditBooking(booking)}
                                className="p-2 text-blue-400 hover:text-blue-300 transition"
                                title="Edit booking"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteBookingId(booking.id)}
                                className="p-2 text-red-400 hover:text-red-300 transition"
                                title="Delete booking"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Booking Edit Form */}
              {editingBooking && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 p-6 rounded-lg mt-6 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Edit Booking</h3>
                    <button
                      onClick={() => {
                        setEditingBooking(null);
                        setBookingFormData({ status: '' });
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                      <select
                        value={bookingFormData.status}
                        onChange={(e) => setBookingFormData({ status: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELED">Canceled</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton type="submit" className="px-4 py-2">Update Booking</LoadingButton>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBooking(null);
                          setBookingFormData({ status: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Complaints Tab */}
          {activeTab === 'complaints' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-6 h-6" />
                  Complaint Management
                </h2>
                <button
                  onClick={async () => {
                    const adminApi = isDjangoAdmin ? djangoAdminService : adminService;
                    try {
                      const refreshedComplaints = await adminApi.getAllComplaints();
                      setComplaints(refreshedComplaints || []);
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
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className={thStyle}>User</th>
                      <th scope="col" className={thStyle}>Type</th>
                      <th scope="col" className={thStyle}>Status</th>
                      <th scope="col" className={thStyle}>Created</th>
                      <th scope="col" className={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                          No complaints found
                        </td>
                      </tr>
                    ) : (
                      complaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-gray-700 transition-colors">
                          <td className={tdStyle}>{complaint.user_details?.email || 'N/A'}</td>
                          <td className={tdStyle}>
                            <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                              {complaint.complaint_type?.replace('_', ' ')}
                            </span>
                          </td>
                          <td className={tdStyle}>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              complaint.status === 'RESOLVED' ? 'bg-green-900 text-green-300' :
                              complaint.status === 'DISMISSED' ? 'bg-red-900 text-red-300' :
                              complaint.status === 'IN_REVIEW' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-gray-700 text-gray-300'
                            }`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className={tdStyle}>
                            {complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className={tdStyle}>
                            <button
                              onClick={() => {
                                setEditingComplaint(complaint);
                                setComplaintFormData({
                                  status: complaint.status,
                                  admin_response: complaint.admin_response || ''
                                });
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Complaint Edit Form */}
              {editingComplaint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 p-6 rounded-lg mt-6 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Manage Complaint</h3>
                    <button
                      onClick={() => {
                        setEditingComplaint(null);
                        setComplaintFormData({ status: '', admin_response: '' });
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mb-4 p-4 bg-gray-800 rounded">
                    <p className="text-white font-medium mb-2">Description:</p>
                    <p className="text-gray-300 text-sm">{editingComplaint.description}</p>
                  </div>
                  <form onSubmit={handleComplaintSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                      <select
                        value={complaintFormData.status}
                        onChange={(e) => setComplaintFormData({ ...complaintFormData, status: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="DISMISSED">Dismissed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Admin Response</label>
                      <textarea
                        value={complaintFormData.admin_response}
                        onChange={(e) => setComplaintFormData({ ...complaintFormData, admin_response: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        placeholder="Enter your response..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton type="submit" className="px-4 py-2">Update Complaint</LoadingButton>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingComplaint(null);
                          setComplaintFormData({ status: '', admin_response: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <StarIcon className="w-6 h-6" />
                Review Management
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className={thStyle}>Service</th>
                      <th scope="col" className={thStyle}>Seeker</th>
                      <th scope="col" className={thStyle}>Rating</th>
                      <th scope="col" className={thStyle}>Comment</th>
                      <th scope="col" className={thStyle}>Created</th>
                      <th scope="col" className={thStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {reviews.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                          No reviews found
                        </td>
                      </tr>
                    ) : (
                      reviews.map((review) => (
                        <tr key={review.id} className="hover:bg-gray-700 transition-colors">
                          <td className={tdStyle}>{review.service_details?.title || 'N/A'}</td>
                          <td className={tdStyle}>
                            {review.seeker_details?.email || 'N/A'}
                          </td>
                          <td className={tdStyle}>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-500'
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-gray-300">({review.rating}/5)</span>
                            </div>
                          </td>
                          <td className={tdStyle}>
                            <div className="max-w-xs truncate text-gray-300">
                              {review.comment || 'No comment'}
                            </div>
                          </td>
                          <td className={tdStyle}>
                            {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className={tdStyle}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="p-2 text-blue-400 hover:text-blue-300 transition"
                                title="Edit review"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteReviewId(review.id)}
                                className="p-2 text-red-400 hover:text-red-300 transition"
                                title="Delete review"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Review Edit Form */}
              {editingReview && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-700 p-6 rounded-lg mt-6 border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Edit Review</h3>
                    <button
                      onClick={() => {
                        setEditingReview(null);
                        setReviewFormData({ rating: '', comment: '' });
                      }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                      <select
                        value={reviewFormData.rating}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, rating: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">Select rating</option>
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Comment</label>
                      <textarea
                        value={reviewFormData.comment}
                        onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                        rows="4"
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        placeholder="Enter your review comment..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <LoadingButton type="submit" className="px-4 py-2">Update Review</LoadingButton>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReview(null);
                          setReviewFormData({ rating: '', comment: '' });
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-6 h-6" />
                Platform Analytics
              </h2>
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Users</h3>
                    <div className="space-y-2">
                      <p className="text-gray-300">Total: <span className="text-white font-bold">{analytics.users.total}</span></p>
                      <p className="text-gray-300">Active: <span className="text-white font-bold">{analytics.users.active}</span></p>
                      <p className="text-gray-300">New (30d): <span className="text-white font-bold">{analytics.users.new_30d}</span></p>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
                    <div className="space-y-2">
                      <p className="text-gray-300">Total: <span className="text-white font-bold">{analytics.services.total}</span></p>
                      <p className="text-gray-300">Avg Price: <span className="text-white font-bold">KES {analytics.services.avg_price.toLocaleString()}</span></p>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Bookings</h3>
                    <div className="space-y-2">
                      <p className="text-gray-300">Total: <span className="text-white font-bold">{analytics.bookings.total}</span></p>
                      <p className="text-gray-300">New (30d): <span className="text-white font-bold">{analytics.bookings.new_30d}</span></p>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
                    <div className="space-y-2">
                      <p className="text-gray-300">Total: <span className="text-white font-bold">{analytics.reviews.total}</span></p>
                      <p className="text-gray-300">Avg Rating: <span className="text-white font-bold">{analytics.reviews.avg_rating}</span></p>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Complaints</h3>
                    <div className="space-y-2">
                      <p className="text-gray-300">Total: <span className="text-white font-bold">{analytics.complaints.total}</span></p>
                      <p className="text-gray-300">New (30d): <span className="text-white font-bold">{analytics.complaints.new_30d}</span></p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Loading analytics...</p>
              )}
            </motion.div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <DocumentTextIcon className="w-6 h-6" />
                  Reports
                </h2>
                <div className="flex items-center gap-3">
                  <select
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value);
                      setReports(null);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    <option value="user_activity">User Activity</option>
                    <option value="service_performance">Service Performance</option>
                    <option value="booking_analytics">Booking Analytics</option>
                  </select>
                  {reports && reports.data && reports.data.length > 0 && (
                    <LoadingButton
                      onClick={handleExportReports}
                      variant="outline"
                      className="px-4 py-2 flex items-center gap-2"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      Export CSV
                    </LoadingButton>
                  )}
                </div>
              </div>
              {reports ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        {reportType === 'user_activity' && (
                          <>
                            <th className={thStyle}>Email</th>
                            <th className={thStyle}>Name</th>
                            <th className={thStyle}>Role</th>
                            <th className={thStyle}>Joined</th>
                          </>
                        )}
                        {reportType === 'service_performance' && (
                          <>
                            <th className={thStyle}>Service</th>
                            <th className={thStyle}>Provider</th>
                            <th className={thStyle}>Category</th>
                            <th className={thStyle}>Price</th>
                            <th className={thStyle}>Bookings</th>
                            <th className={thStyle}>Reviews</th>
                            <th className={thStyle}>Avg Rating</th>
                          </>
                        )}
                        {reportType === 'booking_analytics' && (
                          <>
                            <th className={thStyle}>Date</th>
                            <th className={thStyle}>Total</th>
                            <th className={thStyle}>Confirmed</th>
                            <th className={thStyle}>Completed</th>
                            <th className={thStyle}>Canceled</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {reports.data && reports.data.length > 0 ? (
                        reports.data.map((item, index) => {
                          if (reportType === 'user_activity') {
                            // Map user activity data to columns
                            const firstName = item.first_name || '';
                            const lastName = item.last_name || '';
                            const fullName = `${firstName} ${lastName}`.trim() || 'N/A';
                            return (
                              <tr key={index} className="hover:bg-gray-700">
                                <td className={tdStyle}>{item.email || 'N/A'}</td>
                                <td className={tdStyle}>{fullName}</td>
                                <td className={tdStyle}>{item.role || 'N/A'}</td>
                                <td className={tdStyle}>
                                  {item.date_joined ? new Date(item.date_joined).toLocaleDateString() : 'N/A'}
                                </td>
                              </tr>
                            );
                          } else if (reportType === 'service_performance') {
                            // Map service performance data to columns
                            return (
                              <tr key={index} className="hover:bg-gray-700">
                                <td className={tdStyle}>{item.title || 'N/A'}</td>
                                <td className={tdStyle}>{item.provider__email || 'N/A'}</td>
                                <td className={tdStyle}>{item.category__name || 'N/A'}</td>
                                <td className={tdStyle}>
                                  {item.price !== null && item.price !== undefined 
                                    ? `KES ${parseFloat(item.price).toLocaleString()}` 
                                    : 'N/A'}
                                </td>
                                <td className={tdStyle}>{item.booking_count || 0}</td>
                                <td className={tdStyle}>{item.review_count || 0}</td>
                                <td className={tdStyle}>
                                  {item.avg_rating !== null && item.avg_rating !== undefined 
                                    ? parseFloat(item.avg_rating).toFixed(2) 
                                    : 'N/A'}
                                </td>
                              </tr>
                            );
                          } else if (reportType === 'booking_analytics') {
                            // Map booking analytics data to columns
                            return (
                              <tr key={index} className="hover:bg-gray-700">
                                <td className={tdStyle}>
                                  {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className={tdStyle}>{item.count || 0}</td>
                                <td className={tdStyle}>{item.confirmed || 0}</td>
                                <td className={tdStyle}>{item.completed || 0}</td>
                                <td className={tdStyle}>{item.canceled || 0}</td>
                              </tr>
                            );
                          }
                          return null;
                        })
                      ) : (
                        <tr>
                          <td colSpan="10" className="px-6 py-8 text-center text-gray-400">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Loading report...</p>
              )}
            </motion.div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'audit-logs' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <ClockIcon className="w-6 h-6" />
                Admin Action Logs
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className={thStyle}>Admin</th>
                      <th scope="col" className={thStyle}>Action</th>
                      <th scope="col" className={thStyle}>Resource</th>
                      <th scope="col" className={thStyle}>Description</th>
                      <th scope="col" className={thStyle}>IP Address</th>
                      <th scope="col" className={thStyle}>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {actionLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                          No action logs found
                        </td>
                      </tr>
                    ) : (
                      actionLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-700 transition-colors">
                          <td className={tdStyle}>{log.admin_user_email || 'N/A'}</td>
                          <td className={tdStyle}>
                            <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs">
                              {log.action_type}
                            </span>
                          </td>
                          <td className={tdStyle}>
                            <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                              {log.resource_type} #{log.resource_id}
                            </span>
                          </td>
                          <td className={tdStyle}>{log.description}</td>
                          <td className={tdStyle}>{log.ip_address || 'N/A'}</td>
                          <td className={tdStyle}>
                            {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialogs */}
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
      <ConfirmationDialog
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={`Are you sure you want to delete this user? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      <ConfirmationDialog
        isOpen={!!deleteServiceId}
        onClose={() => setDeleteServiceId(null)}
        onConfirm={handleDeleteService}
        title="Delete Service"
        message={`Are you sure you want to delete this service? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      <ConfirmationDialog
        isOpen={!!deleteBookingId}
        onClose={() => setDeleteBookingId(null)}
        onConfirm={handleDeleteBooking}
        title="Delete Booking"
        message={`Are you sure you want to delete this booking? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
      <ConfirmationDialog
        isOpen={!!deleteReviewId}
        onClose={() => setDeleteReviewId(null)}
        onConfirm={handleDeleteReview}
        title="Delete Review"
        message={`Are you sure you want to delete this review? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </motion.div>
  );
}
