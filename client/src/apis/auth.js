import axios from 'axios';

// Base API URL
//export const url = 'http://localhost:8000';
export const url = 'https://stream-sync-production-6ee8.up.railway.app';


// Axios instance with interceptors
const API = axios.create({
  baseURL: url,
  headers: { Authorization: localStorage.getItem('userToken') },
});

// Refresh token function
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post(`${url}/auth/refresh`, {"refreshToken": refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    console.log('response-----------------------------',response)
    // Update tokens in localStorage
    localStorage.setItem('userToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);

    // Update the Authorization header of the Axios instance
    API.defaults.headers.Authorization = `${accessToken}`;

    return accessToken;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    localStorage.removeItem('userToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// Axios interceptor for handling token refresh
API.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // To prevent infinite retry loops
      try {
        const newAccessToken = await refreshAccessToken();
        console.log(newAccessToken)
        localStorage.setItem('userToken', accessToken);
        originalRequest.headers.Authorization = `${newAccessToken}`;
        return API(originalRequest); // Retry the original request with new token
      } catch (err) {
        console.error('Failed to refresh token, redirecting to login');
        //window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

export const googleLoginUser = async (body) => {
  try {
    return await API.post('/auth/google', body);
  } catch (error) {
    console.error('Error in Google login user API');
    throw error;
  }
};

export const validUser = async () => {
  try {
    const { data } = await API.get('/auth/valid');
    return data;
  } catch (error) {
    console.error('Error in valid user API');
    throw error;
  }
};
