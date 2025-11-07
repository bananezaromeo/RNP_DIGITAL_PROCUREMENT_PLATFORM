// src/components/MyRequests.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('/api/requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
      } catch (err) {
        setError('Failed to fetch requests.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('My Requests Report', 14, 20);
    const tableColumn = ["Product", "Quantity", "Unit", "Status", "Week", "Created At"];
    const tableRows = [];

    requests.forEach(req => {
      const rowData = [
        req.product?.name || '',
        req.quantity,
        req.quantityUnit,
        req.status,
        req.week,
        new Date(req.createdAt).toLocaleString()
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30
    });

    doc.save(`MyRequests_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">My Requests</h5>
        <button className="btn btn-light btn-sm" onClick={generatePDF}>
          Export PDF
        </button>
      </div>
      <div className="card-body table-responsive">
        {requests.length === 0 ? (
          <div className="text-center text-muted">No requests submitted yet.</div>
        ) : (
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Week</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id}>
                  <td>{req.product?.name}</td>
                  <td>{req.quantity}</td>
                  <td>{req.quantityUnit}</td>
                  <td>
                    <span className={
                      req.status === 'approved' ? 'badge bg-success' :
                      req.status === 'rejected' ? 'badge bg-danger' : 'badge bg-warning text-dark'
                    }>
                      {req.status}
                    </span>
                  </td>
                  <td>{req.week}</td>
                  <td>{new Date(req.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
