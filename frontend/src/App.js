

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import PublicRequestsList from './components/PublicRequestsList';
import SupplierRegister from './pages/SupplierRegister'; // ✅ make sure this path is correct
import Login from './pages/Login';
import InternalLogin from './pages/InternalLogin';
import AdminSignup from './pages/AdminSignup';
import Footer from './components/Footer';

// Wrapper to extract ?role param for admin signup
function AdminSignupWrapper() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const role = params.get('role') || '';
  if (!['district','region','hq'].includes(role)) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">Invalid admin role for signup.</div>
      </div>
    );
  }
  return <AdminSignup role={role} />;
}

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const roles = [
    { label: 'Procurement/Admin', value: 'hq' },
    { label: 'District Admin', value: 'district' },
    { label: 'Region Admin', value: 'region' },
    { label: 'Station', value: 'station' },
    { label: 'Special Unit', value: 'special_unit' }
  ];
  useEffect(() => {
    const u = localStorage.getItem('user');
    setUser(u ? JSON.parse(u) : null);
    // Listen for login/logout in other tabs
    const onStorage = () => {
      const u2 = localStorage.getItem('user');
      setUser(u2 ? JSON.parse(u2) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const handleRoleSelect = (e) => {
    if (e.target.value) {
      navigate('/internal-login?role=' + e.target.value);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };
  return (
    <header className="bg-white border-bottom shadow-sm py-2 mb-3">
      <div className="container d-flex flex-wrap justify-content-between align-items-center">
        {/* Left: Logo and nav links */}
        <div className="d-flex align-items-center gap-3">
          <span className="fw-bold text-primary" style={{fontSize: '1.3rem'}}>RNP-DPAMIS</span>
          <Link to="#about" className="nav-link px-2">About</Link>
          <Link to="#help" className="nav-link px-2">Help/Support</Link>
          <Link to="#contact" className="nav-link px-2">Contact</Link>
          <select className="form-select form-select-sm w-auto ms-2" style={{minWidth: 90}} defaultValue="en" onChange={e => alert('Language switcher: ' + e.target.value)}>
            <option value="en">EN</option>
            <option value="rw">RW</option>
            <option value="fr">FR</option>
          </select>
        </div>
        {/* Right: Auth links/profile */}
        <div className="d-flex align-items-center gap-2">
          {!user && <>
            <Link to="/supplier-register" className="btn btn-outline-primary btn-sm me-1">
              Register to Bid
            </Link>
            <Link to="/login?role=supplier" className="btn btn-primary btn-sm me-3">
              Supplier Sign In
            </Link>
            <select className="form-select form-select-sm w-auto" style={{minWidth: 140}} defaultValue="" onChange={handleRoleSelect}>
              <option value="" disabled>Administrations Logins</option>
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </>}
          {user && (
            <div className="dropdown">
              <button className="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                {user.fullName || user.email} <span className="text-muted small">({user.role})</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          {/* ✅ Home / Landing */}
          <Route path="/" element={<PublicRequestsList />} />
          {/* ✅ Supplier Registration Page */}
          <Route path="/supplier-register" element={<SupplierRegister />} />
          {/* ✅ Login Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/internal-login" element={<InternalLogin />} />
          <Route path="/admin-signup" element={<AdminSignupWrapper />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
