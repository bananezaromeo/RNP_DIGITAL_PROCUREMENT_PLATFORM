// frontend/src/pages/SupplierRegister.jsx
import React, { useState } from 'react';
import axios from 'axios';

export default function SupplierRegister() {
  const [form, setForm] = useState({
    fullName: '', companyName: '', email: '', phone: '', password: ''
  });
  const [nationalFile, setNationalFile] = useState(null);
  const [businessFile, setBusinessFile] = useState(null);
  const [message, setMessage] = useState('');

  const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('fullName', form.fullName);
      data.append('companyName', form.companyName);
      data.append('email', form.email);
      data.append('phone', form.phone);
      data.append('password', form.password);
      if (nationalFile) data.append('national_id', nationalFile);
      if (businessFile) data.append('business_license', businessFile);

      const res = await api.post('/api/auth/register-supplier', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'Registered. Pending approval.');
      setForm({ fullName: '', companyName: '', email: '', phone: '', password: '' });
      setNationalFile(null); setBusinessFile(null);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container py-4">
      <h3>Supplier Registration</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label>Full name</label>
          <input className="form-control" name="fullName" value={form.fullName} onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Company name</label>
          <input className="form-control" name="companyName" value={form.companyName} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label>Email</label>
          <input className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Phone</label>
          <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label>Password</label>
          <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
        </div>

        <div className="mb-2">
          <label>National ID (PDF or image)</label>
          <input type="file" accept=".pdf,image/*" className="form-control" onChange={e => setNationalFile(e.target.files[0])} required />
        </div>
        <div className="mb-2">
          <label>Business license (RDB) (PDF or image)</label>
          <input type="file" accept=".pdf,image/*" className="form-control" onChange={e => setBusinessFile(e.target.files[0])} required />
        </div>

        <button className="btn btn-primary" type="submit">Register</button>
      </form>

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}
