import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LoadingButton from './LoadingButton';
import FormInput from './FormInput';

export default function ComplaintForm({ 
  services = [], 
  bookings = [],
  onComplaintCreated, 
  onClose 
}) {
  const [formData, setFormData] = useState({
    complaint_type: '',
    description: '',
    service: '',
    booking: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const complaintTypes = [
    { value: 'SERVICE_ISSUE', label: 'Service Issue' },
    { value: 'BOOKING_ISSUE', label: 'Booking Issue' },
    { value: 'USER_BEHAVIOR', label: 'User Behavior' },
    { value: 'PLATFORM_ISSUE', label: 'Platform Issue' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.complaint_type) {
      newErrors.complaint_type = 'Please select a complaint type';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const complaintData = {
        complaint_type: formData.complaint_type,
        description: formData.description.trim(),
      };

      // Only include service/booking if they're selected
      if (formData.service) {
        complaintData.service = parseInt(formData.service);
      }
      if (formData.booking) {
        complaintData.booking = parseInt(formData.booking);
      }

      await onComplaintCreated(complaintData);
      
      // Reset form
      setFormData({
        complaint_type: '',
        description: '',
        service: '',
        booking: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">File a Complaint</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Complaint Type <span className="text-red-400">*</span>
          </label>
          <select
            name="complaint_type"
            value={formData.complaint_type}
            onChange={handleChange}
            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${
              errors.complaint_type ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:border-blue-500`}
          >
            <option value="">Select a type...</option>
            {complaintTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.complaint_type && (
            <p className="mt-1 text-sm text-red-400">{errors.complaint_type}</p>
          )}
        </div>

        {services.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Related Service (Optional)
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="">None</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {bookings.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Related Booking (Optional)
            </label>
            <select
              name="booking"
              value={formData.booking}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="">None</option>
              {bookings.map(booking => (
                <option key={booking.id} value={booking.id}>
                  {booking.service_details?.title || 'Booking'} - {new Date(booking.booking_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Please describe your complaint in detail..."
            className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${
              errors.description ? 'border-red-500' : 'border-gray-600'
            } focus:outline-none focus:border-blue-500 resize-none`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            {formData.description.length} characters (minimum 10)
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <LoadingButton
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Submit Complaint
          </LoadingButton>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

