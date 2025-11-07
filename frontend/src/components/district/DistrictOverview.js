// src/components/district/DistrictOverview.js
import React from 'react';
import ChartCard from '../common/ChartCard';
import { mockStations, mockRequests, mockDistrictAggregates } from '../../utils/mockData';
import { Bar } from 'react-chartjs-2';

const DistrictOverview = () => {
  // Prepare summary counts
  const totalStations = mockStations.length;
  const totalRequests = mockRequests.length;
  const totalSubmittedToHQ = mockDistrictAggregates.length;

  // Mock chart data
  const products = ['Beans', 'Cassava', 'Tomatoes'];
  const quantities = [150, 200, 120]; // Mock quantities

  const chartData = {
    labels: products,
    datasets: [
      {
        label: 'Quantity (kg)',
        data: quantities,
        backgroundColor: ['#0d6efd', '#198754', '#ffc107'],
      },
    ],
  };

  return (
    <div>
      <h4>Overview</h4>
      <div className="row mb-4">
        <ChartCard title="Total Stations" value={totalStations} />
        <ChartCard title="Total Requests" value={totalRequests} />
        <ChartCard title="Submitted to HQ" value={totalSubmittedToHQ} />
      </div>
      <div>
        <h5>Products vs Quantity (kg)</h5>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default DistrictOverview;
