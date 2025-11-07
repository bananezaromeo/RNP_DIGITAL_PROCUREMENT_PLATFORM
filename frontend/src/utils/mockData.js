// src/utils/mockData.js
// Mock data used for District Dashboard Overview (frontend-only, replace with API later)

export const products = [
  { _id: 'p1', name: 'Beans', unit: 'kg' },
  { _id: 'p2', name: 'Cassava', unit: 'kg' },
  { _id: 'p3', name: 'Tomatoes', unit: 'kg' },
  { _id: 'p4', name: 'Irish Potatoes', unit: 'kg' },
];

export const stations = [
  { id: 's1', name: 'Station A', contact: '0780000001' },
  { id: 's2', name: 'Station B', contact: '0780000002' },
  { id: 's3', name: 'Station C', contact: '0780000003' },
];

export const stationRequests = [
  { id: 'r1', stationId: 's1', productId: 'p1', quantity: 120, week: 42, status: 'pending', createdAt: '2025-10-21' },
  { id: 'r2', stationId: 's2', productId: 'p2', quantity: 200, week: 42, status: 'approved', createdAt: '2025-10-22' },
  { id: 'r3', stationId: 's3', productId: 'p1', quantity: 80,  week: 42, status: 'pending', createdAt: '2025-10-23' },
  { id: 'r4', stationId: 's1', productId: 'p3', quantity: 50,  week: 42, status: 'approved', createdAt: '2025-10-24' },
  { id: 'r5', stationId: 's2', productId: 'p4', quantity: 300, week: 42, status: 'submitted_to_hq', createdAt: '2025-10-25' },
];

// src/utils/mockData.js
export const accounts = [
  { id: 'a1', name: 'Station A', type: 'station', contact: '0780000001', email: 'stationA@rnp.rw' },
  { id: 'a2', name: 'Special Unit B', type: 'special_unit', contact: '0780000002', email: 'specialB@rnp.rw' },
];
