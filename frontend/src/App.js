import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PublicRequestsList from './components/PublicRequestsList';
import SupplierRegister from './pages/SupplierRegister'; // ✅ make sure this path is correct

function App() {
  return (
    <Router>
      <header className="bg-primary text-white py-4">
        <div className="container d-flex justify-content-between align-items-center">
          <div>
            <h1 className="mb-0">RNP-DPAMIS</h1>
            <small>Digital Procurement Aggregation & Market Intelligence System</small>
          </div>
          
          {/* ✅ Optional Nav Button */}
          <Link to="/supplier-register" className="btn btn-light">
            Register to Bid
          </Link>
        </div>
      </header>

      <main>
        <Routes>
          {/* ✅ Home / Landing */}
          <Route path="/" element={<PublicRequestsList />} />

          {/* ✅ Supplier Registration Page */}
          <Route path="/supplier-register" element={<SupplierRegister />} />
        </Routes>
      </main>

      <footer className="bg-light py-3 mt-5">
        <div className="container text-center small text-muted">
          &copy; {new Date().getFullYear()} DPAMIS — Rwanda National Police (prototype)
        </div>
      </footer>
    </Router>
  );
}

export default App;
