import apiClient from '../api/apiClient';

/**
 * Updates the current user's profile information.
 * @param {object} userData - { first_name, last_name, phone_number, address, show_contact_info, profile_image }
 * Note: 'profile_image' should be a File object if provided.
 */
const updateProfile = async (userData) => {
  try {
    // If profile_image is provided, use FormData
    const hasImage = userData.profile_image instanceof File;
    let dataToSend;
    
    if (hasImage) {
      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (key === 'profile_image' && userData[key]) {
          formData.append('profile_image', userData[key]);
        } else if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });
      dataToSend = formData;
    } else {
      dataToSend = userData;
    }
    
    const { data } = await apiClient.patch('/users/me/', dataToSend, hasImage ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {});
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

