import apiClient from '../api/apiClient';

/**
 * Create a review for a service
 */
const createReview = async (reviewData) => {
  try {
    const { data } = await apiClient.post('/reviews/', reviewData);
    return data;
  } catch (error) {
    console.error("Error creating review:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get reviews for a service
 */
const getServiceReviews = async (serviceId) => {
  try {
    const { data } = await apiClient.get(`/reviews/?service=${serviceId}`);
    return data;
  } catch (error) {
    console.error("Error fetching reviews:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get user's reviews
 */
const getMyReviews = async () => {
  try {
    const { data } = await apiClient.get('/reviews/');
    return data;
  } catch (error) {
    console.error("Error fetching my reviews:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get review by ID
 */
const getReview = async (reviewId) => {
  try {
    const { data } = await apiClient.get(`/reviews/${reviewId}/`);
    return data;
  } catch (error) {
    console.error("Error fetching review:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update review
 */
const updateReview = async (reviewId, reviewData) => {
  try {
    const { data } = await apiClient.patch(`/reviews/${reviewId}/`, reviewData);
    return data;
  } catch (error) {
    console.error("Error updating review:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete review
 */
const deleteReview = async (reviewId) => {
  try {
    await apiClient.delete(`/reviews/${reviewId}/`);
  } catch (error) {
    console.error("Error deleting review:", error.response?.data || error.message);
    throw error;
  }
};

export const reviewService = {
  createReview,
  getServiceReviews,
  getMyReviews,
  getReview,
  updateReview,
  deleteReview,
};

