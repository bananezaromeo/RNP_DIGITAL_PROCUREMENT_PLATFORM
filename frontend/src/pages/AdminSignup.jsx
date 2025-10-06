import React, { useState } from 'react';
import RWANDA from '../data/rwanda_locations.json';

export default function AdminSignup({ role }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    policeNumber: '',
    phone: '',
    region: '',
    district: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'region') {
      setForm(f => ({ ...f, region: value, district: '' }));
    } else if (name === 'policeNumber') {
      // Only allow up to 7 digits
      if (/^\d{0,7}$/.test(value)) {
        setForm(f => ({ ...f, policeNumber: value }));
      }
    } else if (name === 'phone') {
      // Only allow digits, up to 9 (for Rwanda after +250)
      if (/^\d{0,9}$/.test(value)) {
        setForm(f => ({ ...f, phone: value }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Placeholder for submit logic
  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('Submitted (backend not yet implemented)');
  };

  // Determine which fields to show based on role
  const showRegion = role === 'district' || role === 'region';
  const showDistrict = role === 'district';
  const isProcurement = role === 'hq';

  return (
    <div className="container py-4">
      <h3>Sign Up as {role === 'district' ? 'District Admin' : role === 'region' ? 'Region HQ Admin' : 'Procurement HQ'}</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div className="mb-2">
          <label>Full Name</label>
          <input className="form-control" name="fullName" value={form.fullName} onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <label>Email</label>
          <input className="form-control" name="email" value={form.email} onChange={handleChange} required disabled={isProcurement} />
          {isProcurement && <div className="form-text">Email is fixed for Procurement HQ</div>}
        </div>
        <div className="mb-2">
          <label>Police Number (7 digits)</label>
          <input
            className="form-control"
            name="policeNumber"
            value={form.policeNumber}
            onChange={handleChange}
            required
            maxLength={7}
            disabled={form.policeNumber.length < 7 ? false : false}
            style={{ backgroundColor: form.policeNumber.length < 7 ? '#f5f5f5' : '#fff' }}
            onFocus={e => e.target.select()}
          />
        </div>
        <div className="mb-2">
          <label>Phone Number</label>
          <div className="input-group">
            <span className="input-group-text" style={{ minWidth: 70 }}>
              <img src="https://flagcdn.com/w20/rw.png" alt="RW" style={{ width: 20, marginRight: 4 }} />
              +250
            </span>
            <input
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              maxLength={9}
              placeholder="7XXXXXXXX"
            />
          </div>
        </div>
        {showRegion && (
          <div className="mb-2">
            <label>Region (Province)</label>
            <select className="form-select" name="region" value={form.region} onChange={handleChange} required>
              <option value="">Select Region</option>
              {Object.keys(RWANDA).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        )}
        {showDistrict && form.region && (
          <div className="mb-2">
            <label>District</label>
            <select className="form-select" name="district" value={form.district} onChange={handleChange} required>
              <option value="">Select District</option>
              {Object.keys(RWANDA[form.region]).map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        )}
        {isProcurement && (
          <div className="mb-2">
            <label>Location</label>
            <input className="form-control" value="Kigali, Kacyiru HQ" disabled readOnly />
          </div>
        )}
        <button className="btn btn-primary w-100" type="submit">Sign Up</button>
      </form>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}
