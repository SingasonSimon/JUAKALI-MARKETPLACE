import apiClient from '../api/apiClient';

/**
 * Complaint Service - Handles complaint-related API calls
 */
const createComplaint = async (complaintData) => {
  try {
    const { data } = await apiClient.post('/complaints/', complaintData);
    return data;
  } catch (error) {
    console.error('Error creating complaint:', error.response?.data || error.message);
    throw error;
  }
};

const getAllComplaints = async () => {
  try {
    const { data } = await apiClient.get('/complaints/');
    return data;
  } catch (error) {
    console.error('Error fetching complaints:', error.response?.data || error.message);
    throw error;
  }
};

const getComplaint = async (complaintId) => {
  try {
    const { data } = await apiClient.get(`/complaints/${complaintId}/`);
    return data;
  } catch (error) {
    console.error('Error fetching complaint:', error.response?.data || error.message);
    throw error;
  }
};

const updateComplaint = async (complaintId, complaintData) => {
  try {
    const { data } = await apiClient.patch(`/complaints/${complaintId}/`, complaintData);
    return data;
  } catch (error) {
    console.error('Error updating complaint:', error.response?.data || error.message);
    throw error;
  }
};

const deleteComplaint = async (complaintId) => {
  try {
    await apiClient.delete(`/complaints/${complaintId}/`);
  } catch (error) {
    console.error('Error deleting complaint:', error.response?.data || error.message);
    throw error;
  }
};

export const complaintService = {
  createComplaint,
  getAllComplaints,
  getComplaint,
  updateComplaint,
  deleteComplaint,
};

