import apiClient from '../api/apiClient';

/**
 * Fetches all service categories.
 */
const getCategories = async () => {
  try {
    const { data } = await apiClient.get('/categories/');
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Creates a new category (Admin only).
 */
const createCategory = async (categoryData) => {
  try {
    const { data } = await apiClient.post('/categories/', categoryData);
    return data;
  } catch (error) {
    console.error("Error creating category:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates an existing category (Admin only).
 */
const updateCategory = async (categoryId, categoryData) => {
  try {
    const { data } = await apiClient.put(`/categories/${categoryId}/`, categoryData);
    return data;
  } catch (error) {
    console.error("Error updating category:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a category (Admin only).
 */
const deleteCategory = async (categoryId) => {
  try {
    await apiClient.delete(`/categories/${categoryId}/`);
  } catch (error) {
    console.error("Error deleting category:", error.response?.data || error.message);
    throw error;
  }
};

export const categoryService = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};