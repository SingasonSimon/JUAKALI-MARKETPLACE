import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { serviceService } from '../services/serviceService';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { ServiceCardSkeleton } from '../components/LoadingSkeleton';
import Pagination from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';

// Animation variants
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
      duration: 0.5
    }
  }
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

// Service Card Component for the grid
function ServiceCard({ service, index }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      custom={index}
    >
      <Link 
        to={`/services/${service.id}`}
        className="block p-6 bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border border-gray-700 hover:border-blue-500"
      >
        <div className="flex flex-col h-full">
          <div className="flex-grow">
            <h3 className="text-xl font-semibold text-white mb-2 min-h-[3.5rem]">{service.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-3">{service.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span className="bg-gray-700 px-2 py-1 rounded">{service.category_details?.name || 'Uncategorized'}</span>
              <span className="text-gray-400">
                {service.provider_details?.first_name} {service.provider_details?.last_name}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-2xl font-bold text-blue-400">KES {parseFloat(service.price).toLocaleString()}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const { dbUser } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (dbUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [dbUser, navigate]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [servicesData, categoriesData] = await Promise.all([
          serviceService.getAllServices(),
          categoryService.getCategories()
        ]);
        setServices(servicesData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load services. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter services based on search, category, and price
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Search filter
      const matchesSearch = debouncedSearchQuery === '' || 
        service.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === '' || 
        service.category === parseInt(selectedCategory);

      // Price filter
      const servicePrice = parseFloat(service.price);
      const matchesMinPrice = priceRange.min === '' || servicePrice >= parseFloat(priceRange.min);
      const matchesMaxPrice = priceRange.max === '' || servicePrice <= parseFloat(priceRange.max);

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });
  }, [services, debouncedSearchQuery, selectedCategory, priceRange]);

  // Pagination for services
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredServices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredServices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedCategory, priceRange]);

  // Don't render homepage if user is logged in (will redirect)
  if (dbUser) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animation */}
      <motion.section 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white py-12 sm:py-16 md:py-20 lg:py-24 border-b border-gray-700"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight"
          >
            Welcome to Juakali Marketplace
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 text-blue-200 max-w-2xl mx-auto px-2 sm:px-0 leading-relaxed"
          >
            Connect with skilled service providers in your area. Find the perfect service for your needs.
          </motion.p>
          {!dbUser ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-4 sm:px-0"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm sm:text-base md:text-lg transition duration-200 shadow-lg hover:shadow-xl text-center"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg text-sm sm:text-base md:text-lg transition duration-200 shadow-lg hover:shadow-xl text-center"
              >
                Sign In
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex justify-center px-4 sm:px-0"
            >
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-block px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm sm:text-base md:text-lg transition duration-200 shadow-lg hover:shadow-xl text-center"
              >
                Go to Dashboard
              </Link>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gray-900 border-b border-gray-800"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose Juakali Marketplace?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                Icon: MagnifyingGlassIcon,
                title: 'Easy Search',
                description: 'Find services quickly with our powerful search and filter tools'
              },
              {
                Icon: CheckBadgeIcon,
                title: 'Verified Providers',
                description: 'All service providers are verified to ensure quality service'
              },
              {
                Icon: CurrencyDollarIcon,
                title: 'Fair Pricing',
                description: 'Compare prices and choose the best deal for your budget'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700 hover:border-blue-500 transition"
              >
                <div className="flex justify-center mb-4">
                  <feature.Icon className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Search and Filter Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="bg-gray-800 py-8 border-b border-gray-700 rounded-lg mx-4 my-6 shadow-lg"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Results count */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-gray-300 text-sm"
          >
            Showing {filteredServices.length} of {services.length} services
          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <ServiceCardSkeleton key={i} />
              ))}
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-500 py-20"
            >
              <p>{error}</p>
            </motion.div>
          ) : filteredServices.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-300 py-20"
            >
              <p className="text-xl mb-2 text-white font-semibold">No services found</p>
              <p className="text-gray-300">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-white mb-8"
              >
                Available Services
              </motion.h2>
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {paginatedServices.map((service, index) => (
                    <ServiceCard key={service.id} service={service} index={index} />
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
            </>
          )}
        </div>
      </section>
    </div>
  );
}
