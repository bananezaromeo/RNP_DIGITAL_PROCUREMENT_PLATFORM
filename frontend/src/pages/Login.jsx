// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/api/auth/login', form);
  setMessage('Login successful! Redirecting...');
  // Store token and user info (for now, localStorage)
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  // Role-based redirect
  const role = res.data.user.role;
  let dashboard = '/';
  if (role === 'supplier') dashboard = '/supplier-dashboard';
  else if (role === 'district') dashboard = '/district-dashboard';
  else if (role === 'region') dashboard = '/region-dashboard';
  else if (role === 'hq') dashboard = '/hq-dashboard';
  else if (role === 'station') dashboard = '/station-dashboard';
  setTimeout(() => navigate(dashboard), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3>Sign In</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div className="mb-2">
          <label>Email</label>
          <input className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Password</label>
          <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn btn-primary w-100" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      {message && <div className="alert alert-info mt-3">{message}</div>}
      <div className="mt-3">
        <span>Don't have an account? </span>
        <a href="/supplier-register" className="btn btn-link">Register as Supplier</a>
      </div>
    </div>
  );
}
