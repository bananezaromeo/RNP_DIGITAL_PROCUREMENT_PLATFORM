// src/components/RequestForm.js
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import axios from 'axios';

const RequestForm = () => {
  const [hqProducts, setHqProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch HQ products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token'); // Auth token
        const res = await axios.get('/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHqProducts(res.data);
      } catch (err) {
        console.error('Error fetching HQ products:', err);
        setMessage('Failed to load products. Please try again later.');
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Auth token
      const res = await axios.post('/api/requests', {
        productId: selectedProduct,
        quantity,
        week: new Date().getWeek() // optionally track week
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Request submitted successfully!');
      setSelectedProduct('');
      setQuantity('');
    } catch (err) {
      console.error('Error submitting request:', err);
      setMessage('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="card shadow-sm border-0">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Request from HQ Product Catalog</h5>
        </div>
        <div className="card-body">
          {message && <div className="alert alert-info">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Select Product (Created by HQ)</label>
              <select
                className="form-select"
                required
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="">-- Select a product --</option>
                {hqProducts.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.unit})</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Quantity Needed</label>
              <input
                type="number"
                className="form-control"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="text-end">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Optional: helper function to get week number
Date.prototype.getWeek = function() {
  const oneJan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - oneJan) / 86400000) + oneJan.getDay()+1)/7);
};

export default RequestForm;
