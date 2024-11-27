import axios from 'axios';

export const importEmployees = async (file, yearType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('yearType', yearType);

  try {
    const response = await axios.post(
      'http://localhost:3001/api/employee/import', 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'An error occurred during import');
    }
    throw new Error('Network error or server unavailable');
  }
};

export const generateAssignments = async (file, yearType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('yearType', yearType);

  try {
    const response = await axios.get('http://localhost:3001/api/generate-assignments');
    return response;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'An error occurred during generate assignment');
    }
    throw new Error('Network error or server unavailable');
  }
};