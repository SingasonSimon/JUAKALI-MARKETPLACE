import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BriefcaseIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../services/adminService';
import { serviceService } from '../services/serviceService';
import { bookingService } from '../services/bookingService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function AdminDashboard() {
  const { dbUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [categoryLoading, setCategoryLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all data in parallel
        const [usersData, servicesData, categoriesData] = await Promise.all([
          adminService.getAllUsers(),
          serviceService.getAllServices(),
          categoryService.getCategories()
        ]);
        setUsers(usersData);
        setServices(servicesData);
        setCategories(categoriesData);
        
        // Try to fetch bookings (might not be available for admin)
        try {
          const bookingsData = await bookingService.getMyBookings();
          setBookings(bookingsData);
        } catch (err) {
          console.warn('Could not fetch bookings:', err);
        }
      } catch (err) {
        setError("Failed to load admin data. You may not have permission.");
        console.error(err);
        showToast('Failed to load admin data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [showToast]);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    setCategoryLoading(true);
    try {
      if (editingCategory) {
        // Update existing category
        const updated = await categoryService.updateCategory(editingCategory.id, categoryFormData);
        setCategories(categories.map(cat => cat.id === updated.id ? updated : cat));
        showToast('Category updated successfully', 'success');
      } else {
        // Create new category
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
  const tdStyle = "px-6 py-4 whitespace-nowrap text-sm text-gray-200";

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
        className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 p-8 shadow-lg border border-gray-700"
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
            <div className="w-24 h-24 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
              <ShieldCheckIcon className="w-12 h-12 text-white" />
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
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
        <div className="border-b border-gray-700">
          <nav className="flex -mb-px">
            {['overview', 'users', 'services', 'categories'].map((tab) => (
              <button
                key={tab}
                data-tab={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Users Table */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className={thStyle}>Name</th>
                      <th scope="col" className={thStyle}>Email</th>
                      <th scope="col" className={thStyle}>Role</th>
                      <th scope="col" className={thStyle}>Status</th>
                      <th scope="col" className={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
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
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Services Table */}
          {activeTab === 'services' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Service Management</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className={thStyle}>Service Title</th>
                      <th scope="col" className={thStyle}>Provider</th>
                      <th scope="col" className={thStyle}>Category</th>
                      <th scope="col" className={thStyle}>Price (KES)</th>
                      <th scope="col" className={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {services.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
              <h2 className="text-2xl font-bold text-white mb-4">Platform Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.first_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-gray-400 text-xs">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'ADMIN' ? 'bg-red-900 text-red-300' :
                          user.role === 'PROVIDER' ? 'bg-blue-900 text-blue-300' :
                          'bg-green-900 text-green-300'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No users yet</p>
                    )}
                  </div>
                </div>

                {/* Recent Services */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Services</h3>
                  <div className="space-y-3">
                    {services.slice(0, 5).map((service) => (
                      <div key={service.id} className="p-3 bg-gray-800 rounded">
                        <p className="text-white text-sm font-medium mb-1">{service.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">
                            {service.category_details?.name || 'Uncategorized'}
                          </span>
                          <span className="text-blue-400 font-bold text-sm">
                            KES {parseFloat(service.price || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && (
                      <p className="text-gray-400 text-center py-4">No services yet</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
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
