import apiClient from '../api/apiClient';

/**
 * Fetches a list of all users.
 * This will only succeed if the user is an ADMIN.
 */
const getAllUsers = async () => {
  try {
    const { data } = await apiClient.get('/admin/users/');
    return data;
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

export const adminService = {
  getAllUsers,
};