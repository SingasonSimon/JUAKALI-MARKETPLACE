import apiClient from '../api/apiClient';

/**
 * Creates a new booking for a service.
 * This can only be done by an authenticated SEEKER.
 * @param {object} bookingData - { service, booking_date }
 * 'service' is the ID of the service.
 * 'booking_date' is an ISO 8601 formatted string (e.g., "2025-11-20T14:00:00Z").
 */
const createBooking = async (bookingData) => {
  try {
    // The seeker's token is added automatically.
    // The backend uses the token to set the 'seeker' field.
    const { data } = await apiClient.post('/bookings/', bookingData);
    return data;
  } catch (error) {
    console.error("Error creating booking:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches the user's bookings.
 * - If called by a SEEKER, returns bookings they made.
 * - If called by a PROVIDER, returns bookings for their services.
 */
const getMyBookings = async () => {
  try {
    const { data } = await apiClient.get('/bookings/');
    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates a booking.
 * Can be used by a Seeker to cancel (e.g., status: "CANCELED").
 * Can be used by a Provider to confirm (e.g., status: "CONFIRMED").
 * @param {string|number} bookingId - The ID of the booking to update.
 * @param {object} updateData - The fields to update (e.g., { status }).
 */
const updateBooking = async (bookingId, updateData) => {
  try {
    const { data } = await apiClient.patch(`/bookings/${bookingId}/`, updateData);
    return data;
  } catch (error) {
    console.error("Error updating booking:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a booking.
 * This can typically only be done by the SEEKER who made it.
 * @param {string|number} bookingId - The ID of the booking to delete.
 */
const deleteBooking = async (bookingId) => {
  try {
    await apiClient.delete(`/bookings/${bookingId}/`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting booking:", error.response?.data || error.message);
    throw error;
  }
};

export const bookingService = {
  createBooking,
  getMyBookings,
  updateBooking,
  deleteBooking,
};