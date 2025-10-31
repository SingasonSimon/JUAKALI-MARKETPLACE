import apiClient from '../api/apiClient';

/**
 * Updates the current user's profile information.
 * @param {object} userData - { first_name, last_name }
 */
const updateProfile = async (userData) => {
  try {
    const { data } = await apiClient.patch('/users/me/', userData);
    return data;
  } catch (error) {
    console.error("Error updating profile:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gets the current user's profile information.
 */
const getProfile = async () => {
  try {
    const { data } = await apiClient.get('/users/me/');
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error.response?.data || error.message);
    throw error;
  }
};

export const userService = {
  updateProfile,
  getProfile,
};

