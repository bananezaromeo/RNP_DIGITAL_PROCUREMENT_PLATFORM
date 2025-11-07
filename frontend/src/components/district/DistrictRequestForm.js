// src/components/DistrictRequestForm.js
import React, { useState, useEffect } from "react";

const DistrictRequestForm = () => {
  const [hqRequests, setHqRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState("");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Replace with actual API call: /api/hq/requests
    setHqRequests([
      { id: 1, title: "Quarter 1 Procurement", commodities: ["Beans", "Cassava", "Maize"] },
      { id: 2, title: "Emergency Relief Request", commodities: ["Beans", "Rice"] },
    ]);
  }, []);

  const handleSelectChange = (e) => {
    const req = hqRequests.find(r => r.id === parseInt(e.target.value));
    setSelectedRequest(req);
    if (req) {
      const initialForm = {};
      req.commodities.forEach(c => (initialForm[c] = ""));
      setFormData(initialForm);
    }
  };

  const handleInputChange = (commodity, value) => {
    setFormData(prev => ({ ...prev, [commodity]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting district totals:", formData);
    alert("Request submitted successfully (demo mode). Backend integration coming soon.");
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-3">District Request Submission</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Select HQ Request:</label>
          <select className="form-select" onChange={handleSelectChange}>
            <option value="">-- Select Request --</option>
            {hqRequests.map(req => (
              <option key={req.id} value={req.id}>
                {req.title}
              </option>
            ))}
          </select>
        </div>

        {selectedRequest && (
          <div>
            <h4 className="font-semibold mb-2">Fill in Quantities (kg)</h4>
            {selectedRequest.commodities.map(c => (
              <div className="mb-2" key={c}>
                <label>{c}</label>
                <input
                  type="number"
                  value={formData[c]}
                  onChange={(e) => handleInputChange(c, e.target.value)}
                  placeholder={`Enter ${c} quantity`}
                  className="form-control"
                  required
                />
              </div>
            ))}
            <button type="submit" className="btn btn-primary mt-3">
              Submit Request
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default DistrictRequestForm;
