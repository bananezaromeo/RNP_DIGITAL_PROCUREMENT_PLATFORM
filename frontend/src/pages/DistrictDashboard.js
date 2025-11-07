import React, { useState, useMemo } from "react";
import DistrictSidebar from "../components/common/DistrictSidebar";
import DistrictHeader from "../components/common/DistrictHeader";
import StationRequestsTable from "../components/district/StationRequestsTable";
import StationAccounts from "../components/district/StationAccounts";
import DistrictRequestForm from "../components/district/DistrictRequestForm";
import DistrictReports from "../components/district/DistrictReports";
import DistrictChat from "../components/district/DistrictChat";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

import { products, stations, stationRequests } from "../utils/mockData";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const OverviewCards = ({ totals }) => (
  <div className="row g-3 mb-4">
    <div className="col-md-4 col-6">
      <div className="card shadow-sm">
        <div className="card-body text-center">
          <h6 className="text-muted">Total Stations</h6>
          <div className="display-6">{totals.stations}</div>
        </div>
      </div>
    </div>
    <div className="col-md-4 col-6">
      <div className="card shadow-sm">
        <div className="card-body text-center">
          <h6 className="text-muted">Total Requests</h6>
          <div className="display-6">{totals.requests}</div>
        </div>
      </div>
    </div>
    <div className="col-md-4 col-12">
      <div className="card shadow-sm">
        <div className="card-body text-center">
          <h6 className="text-muted">Submitted to HQ</h6>
          <div className="display-6">{totals.submittedToHQ}</div>
        </div>
      </div>
    </div>
  </div>
);

const DistrictDashboard = () => {
  const [active, setActive] = useState("Overview");

  // summary totals computed from mock data
  const totals = useMemo(() => {
    const stationsCount = stations.length;
    const requestsCount = stationRequests.length;
    const submittedToHQ = stationRequests.filter(r => r.status === 'submitted_to_hq').length;
    return { stations: stationsCount, requests: requestsCount, submittedToHQ };
  }, []);

  // product quantities aggregation for chart
  const productAggregation = useMemo(() => {
    const map = {};
    products.forEach(p => (map[p._id] = 0));
    stationRequests.forEach(r => {
      if (map[r.productId] !== undefined) map[r.productId] += Number(r.quantity || 0);
    });
    return products.map(p => ({ name: p.name, qty: map[p._id] || 0 }));
  }, []);

  const chartData = {
    labels: productAggregation.map(p => p.name),
    datasets: [
      {
        label: 'Total Quantity (kg)',
        data: productAggregation.map(p => p.qty),
        backgroundColor: '#0d6efd88',
        borderColor: '#0d6efd',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <DistrictHeader />
      <div className="d-flex flex-grow-1">
        <DistrictSidebar active={active} setActive={setActive} />

        <div className="flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa" }}>
          {/* Overview Section */}
          {active === "Overview" && (
            <>
              <h4 className="mb-3">District Overview</h4>
              <OverviewCards totals={totals} />

              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <strong>Products vs Quantities</strong>
                  <small className="text-muted">Mock data preview</small>
                </div>
                <div className="card-body" style={{ height: 360 }}>
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>

              <div className="mt-4">
                <h5>Recent Station Requests</h5>
                <div className="table-responsive">
                  <table className="table table-sm table-striped mt-2">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Station</th>
                        <th>Product</th>
                        <th>Qty (kg)</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stationRequests.slice(0, 10).map((r, idx) => {
                        const station = stations.find(s => s.id === r.stationId);
                        const product = products.find(p => p._id === r.productId);
                        return (
                          <tr key={r.id}>
                            <td>{idx + 1}</td>
                            <td>{station?.name || r.stationId}</td>
                            <td>{product?.name || r.productId}</td>
                            <td>{r.quantity}</td>
                            <td>
                              <span className={
                                r.status === 'approved' ? 'badge bg-success' :
                                r.status === 'rejected' ? 'badge bg-danger' :
                                r.status === 'submitted_to_hq' ? 'badge bg-info text-dark' :
                                'badge bg-warning text-dark'
                              }>
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
              </div>
            </>
          )}

          {/* Other Sections */}
          {active === "Accounts" && <StationAccounts />}
          {active === "Station Requests" && <StationRequestsTable />}
          {active === "District Request Form" && <DistrictRequestForm />}
          {active === "Reports" && <DistrictReports />}
          {active === "Chat" && <DistrictChat />}
          {active === "Account Settings" && (
            <div>
              <h3>Account Settings</h3>
              <p>Edit your profile and change password.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistrictDashboard;
