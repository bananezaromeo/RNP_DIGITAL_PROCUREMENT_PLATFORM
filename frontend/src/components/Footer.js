import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-light border-top mt-auto py-3">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div className="mb-2 mb-md-0">
          <span className="fw-bold">Rwanda National Police Procurement Platform</span> &copy; {new Date().getFullYear()}<br />
          <small className="text-muted">All rights reserved.</small>
        </div>
        <div className="d-flex flex-column flex-md-row align-items-center gap-3">
          <div>
            <Link to="/about" className="text-decoration-none me-3">About</Link>
            <Link to="/help" className="text-decoration-none me-3">Help/Support</Link>
            <Link to="/contact" className="text-decoration-none">Contact</Link>
          </div>
          <div>
            <select className="form-select form-select-sm" style={{ minWidth: 90 }} defaultValue="en">
              <option value="en">EN</option>
              <option value="rw">RW</option>
              <option value="fr">FR</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}
