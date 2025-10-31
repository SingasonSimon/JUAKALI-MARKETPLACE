import apiClient from '../api/apiClient';

/**
 * Syncs the Firebase user with our Django backend and sets their role.
 * This should be called immediately after a user registers.
 *
 * @param {object} userData - { role, firstName, lastName }
 */
const syncUser = async (userData) => {
  try {
    const { data } = await apiClient.patch('/users/me/', userData);
    
    // The server returns the complete user profile from the database
    return data; 
  } catch (error) {
    console.error("Error syncing user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches the current user's data from our Django backend.
 * This is used to check if a user is "registered" in our DB
 * and to get their role.
 */
const getCurrentUser = async () => {
  try {
    const { data } = await apiClient.get('/users/me/');
    return data;
  } catch (error) {
    
    console.error("Error fetching user:", error.response?.data || error.message);
    throw error;
  }
};

export const authService = {
  syncUser,
  getCurrentUser,
};