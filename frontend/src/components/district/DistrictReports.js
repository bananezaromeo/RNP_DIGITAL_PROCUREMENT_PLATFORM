import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { stationRequests, stations, products } from "../../utils/mockData"; // ✅ fixed path

const DistrictReports = () => {
  const [filterStatus, setFilterStatus] = useState("all");

  // ✅ Filter requests based on status
  const filteredRequests =
    filterStatus === "all"
      ? stationRequests
      : stationRequests.filter((r) => r.status === filterStatus);

  // ✅ Calculate summary statistics
  const totalRequests = stationRequests.length;
  const approved = stationRequests.filter((r) => r.status === "approved").length;
  const rejected = stationRequests.filter((r) => r.status === "rejected").length;
  const pending = stationRequests.filter((r) => r.status === "pending").length;
  const submittedToHQ = stationRequests.filter(
    (r) => r.status === "submitted_to_hq"
  ).length;

  // ✅ PDF generation function (locally defined)
  const generateDistrictPDF = (data) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("District Report Summary", 14, 15);

    // Summary
    doc.setFontSize(11);
    doc.text(
      `Total: ${totalRequests} | Approved: ${approved} | Rejected: ${rejected} | Pending: ${pending} | Submitted to HQ: ${submittedToHQ}`,
      14,
      25
    );

    // Table
    doc.autoTable({
      startY: 35,
      head: [["#", "Station", "Product", "Quantity", "Status", "Date"]],
      body: data.map((r, i) => {
        const station = stations.find((s) => s.id === r.stationId);
        const product = products.find((p) => p._id === r.productId);
        return [
          i + 1,
          station?.name || r.stationId,
          product?.name || r.productId,
          r.quantity,
          r.status,
          new Date(r.createdAt).toLocaleDateString(),
        ];
      }),
    });

    doc.save("District_Report.pdf");
  };

  // ✅ Handle PDF export
  const handleExportPDF = () => {
    generateDistrictPDF(filteredRequests);
  };

  return (
    <div className="card shadow-sm p-3">
      <h3 className="mb-3">District Reports & Summary</h3>

      {/* Summary Cards */}
      <div className="row mb-3 text-center">
        <div className="col-md-3">
          <div className="card bg-primary text-white p-3">
            <h5>Total Requests</h5>
            <p className="fs-4">{totalRequests}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white p-3">
            <h5>Approved</h5>
            <p className="fs-4">{approved}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white p-3">
            <h5>Rejected</h5>
            <p className="fs-4">{rejected}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark p-3">
            <h5>Pending</h5>
            <p className="fs-4">{pending}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <label>Status Filter: </label>
          <select
            className="form-select form-select-sm w-auto d-inline ms-2"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
            <option value="submitted_to_hq">Submitted to HQ</option>
          </select>
        </div>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleExportPDF}
        >
          Export as PDF
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-sm align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Station</th>
              <th>Product</th>
              <th>Quantity (kg)</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((r, idx) => {
              const station = stations.find((s) => s.id === r.stationId);
              const product = products.find((p) => p._id === r.productId);
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-muted small mt-3">
        *This report shows summarized requests from all stations under your
        district. Use the filter to refine and export to PDF.
      </p>
    </div>
  );
};

export default DistrictReports;
