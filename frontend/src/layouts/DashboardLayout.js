// src/layouts/DashboardLayout.js
import React from 'react';
import Header from '../App'; // or adjust import if Header is exported separately
import Footer from '../components/Footer';

const DashboardLayout = ({ children }) => (
  <>
    <Header />
    <main className="container my-4">
      {children}
    </main>
    <Footer />
  </>
);

export default DashboardLayout;
