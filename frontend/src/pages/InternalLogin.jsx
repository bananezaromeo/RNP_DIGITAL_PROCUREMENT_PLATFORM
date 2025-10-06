// frontend/src/pages/InternalLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function InternalLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role') || '';

  const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // Send role as part of login for backend validation if needed
      const res = await api.post('/api/auth/login', { ...form, role });
  setMessage('Login successful! Redirecting...');
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
      <h3 className="mb-3">Administrations Logins</h3>
      <div className="mb-3 text-muted" style={{ maxWidth: 400 }}>
        <small>
          This portal is for <b>internal RNP staff and administrators</b> only.<br />
          Please sign in with your assigned credentials to access the administration dashboard and internal features.
        </small>
      </div>
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
        <a href={`/admin-signup?role=${role}`} className="btn btn-link">Sign up as {role === 'district' ? 'District Admin' : role === 'region' ? 'Region HQ Admin' : role === 'hq' ? 'Procurement HQ' : 'Admin'}</a>
      </div>
    </div>
  );
}
