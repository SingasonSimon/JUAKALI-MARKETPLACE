import apiClient from '../api/apiClient';

/**
 * Fetches all services.
 */
const getAllServices = async () => {
  try {
    const { data } = await apiClient.get('/services/');
    return data;
  } catch (error) {
    console.error("Error fetching services:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches only the services for the currently logged-in provider.
 */
const getMyServices = async () => {
  try {
    const { data } = await apiClient.get('/services/my-services/');
    return data;
  } catch (error) {
    console.error("Error fetching my services:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches a single service by its ID.
 * @param {string|number} serviceId - The ID of the service.
 */
const getServiceById = async (serviceId) => {
  try {
    const { data } = await apiClient.get(`/services/${serviceId}/`);
    return data;
  } catch (error) {
    console.error("Error fetching service details:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Creates a new service.
 * This can only be done by an authenticated PROVIDER.
 * @param {object} serviceData - { title, description, price, category }
 * Note: 'category' should be the ID of the category.
 */
const createService = async (serviceData) => {
  try {
    // The provider token is added automatically by the interceptor.
    // Our backend uses the token to set the 'provider' field.
    const { data } = await apiClient.post('/services/', serviceData);
    return data;
  } catch (error) {
    console.error("Error creating service:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates an existing service.
 * This can only be done by the PROVIDER who owns the service.
 * @param {string|number} serviceId - The ID of the service to update.
 * @param {object} serviceData - The fields to update (e.g., { title, price }).
 */
const updateService = async (serviceId, serviceData) => {
  try {
    const { data } = await apiClient.patch(`/services/${serviceId}/`, serviceData);
    return data;
  } catch (error) {
    console.error("Error updating service:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a service.
 * This can only be done by the PROVIDER who owns the service.
 * @param {string|number} serviceId - The ID of the service to delete.
 */
const deleteService = async (serviceId) => {
  try {
    await apiClient.delete(`/services/${serviceId}/`);
    // No content is returned on a successful delete (204)
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error.response?.data || error.message);
    throw error;
  }
};

export const serviceService = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
};