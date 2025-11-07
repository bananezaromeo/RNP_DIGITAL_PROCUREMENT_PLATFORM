import React, { useState } from "react";
import { stationRequests as initialRequests, stations, products } from "../../utils/mockData";

const StationRequestsTable = () => {
  const [requests, setRequests] = useState(initialRequests);

  // ✅ Function to update status
  const handleStatusChange = (id, newStatus) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // ✅ Optional: handle forwarding to HQ
  const handleForwardToHQ = (id) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: "submitted_to_hq" } : r))
    );
    alert("Request forwarded to HQ successfully!");
  };

  return (
    <div className="card shadow-sm p-3">
      <h3 className="mb-3">Station / Special Unit Requests</h3>

      <div className="table-responsive">
        <table className="table table-sm table-striped align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Station</th>
              <th>Product</th>
              <th>Qty (kg)</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, idx) => {
              const station = stations.find(s => s.id === r.stationId);
              const product = products.find(p => p._id === r.productId);

              return (
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td>{station?.name || r.stationId}</td>
                  <td>{product?.name || r.productId}</td>
                  <td>{r.quantity}</td>
                  <td>
                    <span
                      className={
                        r.status === "approved"
                          ? "badge bg-success"
                          : r.status === "rejected"
                          ? "badge bg-danger"
                          : r.status === "submitted_to_hq"
                          ? "badge bg-info text-dark"
                          : "badge bg-warning text-dark"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    {r.status === "pending" && (
                      <>
                        <button
                          className="btn btn-sm btn-success me-1"
                          onClick={() => handleStatusChange(r.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger me-1"
                          onClick={() => handleStatusChange(r.id, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {r.status === "approved" && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleForwardToHQ(r.id)}
                      >
                        Forward to HQ
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StationRequestsTable;
