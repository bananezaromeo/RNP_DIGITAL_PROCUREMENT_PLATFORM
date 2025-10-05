import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  timeout: 10000,
});

export const fetchPublicRequests = () => API.get('/api/public-requests');
export default API;
