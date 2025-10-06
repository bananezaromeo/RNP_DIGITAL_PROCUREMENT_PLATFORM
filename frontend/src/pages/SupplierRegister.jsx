// frontend/src/pages/SupplierRegister.jsx
import React, { useState } from 'react';
import axios from 'axios';


import RWANDA from '../data/rwanda_locations.json';

export default function SupplierRegister() {
  const [form, setForm] = useState({
    supplierType: '',
    fullName: '',
    cooperativeName: '',
    email: '',
    phone: '',
    password: '',
    province: '',
    district: '',
    sector: ''
  });
  const [nationalFile, setNationalFile] = useState(null);
  const [businessFile, setBusinessFile] = useState(null);
  const [message, setMessage] = useState('');

  const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset lower levels if parent changes
    if (name === 'province') {
      setForm(f => ({ ...f, province: value, district: '', sector: '' }));
    } else if (name === 'district') {
      setForm(f => ({ ...f, district: value, sector: '' }));
    } else if (name === 'supplierType') {
      setForm(f => ({
        ...f,
        supplierType: value,
        fullName: '',
        cooperativeName: ''
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('supplierType', form.supplierType);
      if (form.supplierType === 'individual') {
        data.append('fullName', form.fullName);
      } else if (form.supplierType === 'cooperative') {
        data.append('cooperativeName', form.cooperativeName);
      }
      data.append('email', form.email);
      data.append('phone', form.phone);
      data.append('password', form.password);
      data.append('province', form.province);
      data.append('district', form.district);
      data.append('sector', form.sector);
      if (nationalFile) data.append('national_id', nationalFile);
      if (businessFile) data.append('business_license', businessFile);

      const res = await api.post('/api/auth/register-supplier', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'Registered. Pending approval.');
      setForm({ supplierType: '', fullName: '', cooperativeName: '', email: '', phone: '', password: '', province: '', district: '', sector: '' });
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
          <label>Supplier Type</label>
          <select className="form-select" name="supplierType" value={form.supplierType} onChange={handleChange} required>
            <option value="">Select type</option>
            <option value="individual">Individual</option>
            <option value="cooperative">Cooperative</option>
          </select>
        </div>
        {form.supplierType === 'individual' && (
          <div className="mb-2">
            <label>Full Name</label>
            <input className="form-control" name="fullName" value={form.fullName} onChange={handleChange} required />
          </div>
        )}
        {form.supplierType === 'cooperative' && (
          <div className="mb-2">
            <label>Cooperative Name</label>
            <input className="form-control" name="cooperativeName" value={form.cooperativeName} onChange={handleChange} required />
          </div>
        )}
        <div className="mb-2">
          <label>Email</label>
          <input className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Phone</label>
          <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
        </div>

        {/* Location selection */}
        <div className="mb-2 row g-2 align-items-end">
          <div className="col-auto">
            <label className="form-label mb-0">Country</label>
            <input style={{ width: 120 }} className="form-control form-control-sm" value="Rwanda" disabled readOnly />
          </div>
          <div className="col-auto">
            <label className="form-label mb-0">Province</label>
            <select style={{ width: 140 }} className="form-control form-control-sm" name="province" value={form.province} onChange={handleChange} required>
              <option value="">Province</option>
              {Object.keys(RWANDA).map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
          {form.province && (
            <div className="col-auto">
              <label className="form-label mb-0">District</label>
              <select style={{ width: 140 }} className="form-control form-control-sm" name="district" value={form.district} onChange={handleChange} required>
                <option value="">District</option>
                {Object.keys(RWANDA[form.province]).map(dist => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          )}
          {form.district && (
            <div className="col-auto">
              <label className="form-label mb-0">Sector</label>
              <select style={{ width: 140 }} className="form-control form-control-sm" name="sector" value={form.sector} onChange={handleChange} required>
                <option value="">Sector</option>
                {RWANDA[form.province][form.district].map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        {form.province && (
          <div className="mb-2">
            <label>District</label>
            <select className="form-control" name="district" value={form.district} onChange={handleChange} required>
              <option value="">Select district</option>
              {Object.keys(RWANDA[form.province]).map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
        )}
        {form.district && (
          <div className="mb-2">
            <label>Sector</label>
            <select className="form-control" name="sector" value={form.sector} onChange={handleChange} required>
              <option value="">Select sector</option>
              {RWANDA[form.province][form.district].map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        )}
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

      <div className="mt-3">
        <span>Already have an account? </span>
        <a href="/login" className="btn btn-link">Sign In</a>
      </div>
    </div>
  );
}
