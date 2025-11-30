import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { paymentService } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import LoadingButton from '../components/LoadingButton';
import { PaymentCardSkeleton } from '../components/LoadingSkeleton';

const statusColors = {
  PENDING: 'bg-yellow-900 text-yellow-300',
  PENDING_VERIFICATION: 'bg-blue-900 text-blue-300',
  COMPLETED: 'bg-green-900 text-green-300',
  FAILED: 'bg-red-900 text-red-300',
  REFUNDED: 'bg-gray-900 text-gray-300',
};

const statusLabels = {
  PENDING: 'Pending',
  PENDING_VERIFICATION: 'Under Review',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

const statusIcons = {
  PENDING: ClockIcon,
  PENDING_VERIFICATION: ClockIcon,
  COMPLETED: CheckCircleIcon,
  FAILED: XCircleIcon,
  REFUNDED: ArrowPathIcon,
};

function PaymentCard({ payment }) {
  const StatusIcon = statusIcons[payment.status] || ClockIcon;
  const booking = payment.booking_details;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {booking?.service_title || 'Service'}
          </h3>
          <p className="text-sm text-gray-400">
            Booking Date: {booking?.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusColors[payment.status] || 'bg-gray-700'}`}>
          <StatusIcon className="w-4 h-4" />
          {statusLabels[payment.status] || payment.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Amount:</span>
          <span className="text-white font-semibold">KES {parseFloat(payment.amount).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Payment Method:</span>
          <span className="text-white">{payment.payment_method || 'M-Pesa'}</span>
        </div>
        {payment.provider_payment_number && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mt-3">
            <p className="text-xs text-blue-300 mb-1">Pay to:</p>
            <p className="text-white font-mono font-semibold">{payment.provider_payment_number}</p>
          </div>
        )}
        {payment.created_at && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Created:</span>
            <span className="text-white">{new Date(payment.created_at).toLocaleDateString()}</span>
          </div>
        )}
        {payment.completed_at && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Completed:</span>
            <span className="text-white">{new Date(payment.completed_at).toLocaleDateString()}</span>
          </div>
        )}
        {payment.admin_notes && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Admin Notes:</p>
            <p className="text-sm text-gray-300">{payment.admin_notes}</p>
          </div>
        )}
      </div>

      {payment.payment_screenshot && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Your Payment Screenshot:</p>
          <img
            src={payment.payment_screenshot}
            alt="Payment screenshot"
            className="w-full rounded-lg border border-gray-700"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {payment.status === 'PENDING_VERIFICATION' && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
            <p className="text-sm text-blue-300 flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Your payment is under review by admin
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function SeekerPaymentsPage() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPayments();
  }, [statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = statusFilter === 'all' ? null : statusFilter;
      const data = await paymentService.getSeekerPayments(status);
      setPayments(data);
    } catch (err) {
      setError('Failed to load payments. Please try again.');
      console.error(err);
      showToast('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.booking_details?.service_title?.toLowerCase().includes(query) ||
      payment.amount?.toString().includes(query)
    );
  });

  const stats = {
    total: payments.length,
    completed: payments.filter((p) => p.status === 'COMPLETED').length,
    pending: payments.filter((p) => p.status === 'PENDING').length,
    pendingVerification: payments.filter((p) => p.status === 'PENDING_VERIFICATION').length,
    totalPaid: payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
  };

  return (
    <div className="w-full">
      {/* Sub-header */}
      <div className="mb-6">
        <p className="text-gray-400">View all your payment history and status</p>
      </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Payments</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending + stats.pendingVerification}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-blue-400">KES {stats.totalPaid.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by service or amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PENDING_VERIFICATION">Under Review</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <LoadingButton
              onClick={loadPayments}
              loading={loading}
              className="px-4 py-2"
            >
              Refresh
            </LoadingButton>
          </div>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <PaymentCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
            <CreditCardIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-300 mb-2 font-semibold text-lg">No payments found</p>
            <p className="text-gray-400 text-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'You have no payments yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        )}
    </div>
  );
}

