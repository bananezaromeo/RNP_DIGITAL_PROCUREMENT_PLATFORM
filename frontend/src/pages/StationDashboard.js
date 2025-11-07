// src/pages/StationDashboard.js
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const StationDashboard = () => {
  const [active, setActive] = useState("Overview");
  const [requests, setRequests] = useState([]);
  const [hqCarts, setHqCarts] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [overview, setOverview] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Fetch requests for My Requests & Overview
  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      const pending = res.data.filter(r => r.status === "pending").length;
      const approved = res.data.filter(r => r.status === "approved").length;
      const rejected = res.data.filter(r => r.status === "rejected").length;
      setOverview({ pending, approved, rejected, total: res.data.length });
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // Fetch HQ cart items for Submit Request
  const fetchHqCarts = async () => {
    try {
      const res = await axios.get("/api/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHqCarts(res.data);
    } catch (err) {
      console.error("Error fetching HQ cart items:", err);
    }
  };

  useEffect(() => {
    if (active === "My Requests" || active === "Overview") {
      fetchRequests();
    }
    if (active === "Submit Request") {
      fetchHqCarts();
    }
  }, [active]);

  // Submit request to backend
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;

    try {
      await axios.post(
        "/api/requests",
        { productId: selectedItem, quantity, week: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Request submitted successfully!");
      setSelectedItem("");
      setQuantity("");
      fetchRequests(); // Update My Requests
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit request.");
    }
  };

  // Generate PDF from My Requests
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("My Requests Report", 14, 20);
    const tableColumn = ["#", "Product", "Quantity", "Unit", "Status", "Week", "Date"];
    const tableRows = requests.map((r, idx) => [
      idx + 1,
      r.product?.name,
      r.quantity,
      r.quantityUnit,
      r.status,
      r.week,
      new Date(r.createdAt).toLocaleDateString()
    ]);

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30 });
    doc.save(`MyRequests_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="d-flex flex-grow-1">
        <Sidebar active={active} setActive={setActive} />

        <div className="flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa" }}>
          
          {/* Overview */}
          {active === "Overview" && (
            <div className="row g-3">
              {["pending", "approved", "rejected", "total"].map((key, idx) => (
                <div key={idx} className="col-md-3 col-6">
                  <div className="card text-center">
                    <div className="card-body">
                      <h5 className="text-capitalize">{key}</h5>
                      <p className="display-6">{overview[key]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Request */}
          {active === "Submit Request" && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Request from HQ Cart</h5>
              </div>
              <div className="card-body">
                {message && <div className="alert alert-success">{message}</div>}
                <form onSubmit={handleSubmitRequest}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Select Item (HQ Catalog)</label>
                    <select
                      className="form-select"
                      required
                      value={selectedItem}
                      onChange={e => setSelectedItem(e.target.value)}
                    >
                      <option value="">-- Select an item --</option>
                      {hqCarts.map(item => (
                        <option key={item._id} value={item._id}>{item.name}</option>
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
                      onChange={e => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary">Submit Request</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* My Requests */}
          {active === "My Requests" && (
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
                        <th>#</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Status</th>
                        <th>Week</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r, idx) => (
                        <tr key={r._id}>
                          <td>{idx + 1}</td>
                          <td>{r.product?.name}</td>
                          <td>{r.quantity}</td>
                          <td>{r.quantityUnit}</td>
                          <td>
                            <span className={
                              r.status === "approved" ? "badge bg-success" :
                              r.status === "rejected" ? "badge bg-danger" :
                              "badge bg-warning text-dark"
                            }>
                              {r.status}
                            </span>
                          </td>
                          <td>{r.week}</td>
                          <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Chat */}
          {active === "Chat" && (
            <div>
              <h4>Encrypted Chat with District Admin</h4>
              <p>Feature coming soon...</p>
            </div>
          )}

          {/* Reports */}
          {active === "Reports" && (
            <div>
              <h4>Reports & PDF Export</h4>
              <p>Feature coming soon...</p>
            </div>
          )}

          {/* Account Settings */}
          {active === "Account Settings" && (
            <div>
              <h4>Profile Management</h4>
              <p>Update your info, change password, and upload profile picture.</p>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StationDashboard;
