import React, { useState } from "react";

const StationAccounts = () => {
const [formData, setFormData] = useState({
fullName: "",
email: "",
phone: "",
stationName: "",
locationRegion: "",
locationDistrict: "",
policeAdminNumber: ""
});

const handleChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
e.preventDefault();
console.log("Submitting Station Account:", formData);
// TODO: call your API to create account
};

return ( <div className="card shadow-sm p-4"> <h3 className="mb-3">Create Station/Special Unit Account</h3> <form onSubmit={handleSubmit}> <div className="mb-3"> <label className="form-label">Full Name</label> <input
         type="text"
         name="fullName"
         className="form-control"
         value={formData.fullName}
         onChange={handleChange}
         required
       /> </div>

```
    <div className="mb-3">
      <label className="form-label">Email</label>
      <input
        type="email"
        name="email"
        className="form-control"
        value={formData.email}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Phone</label>
      <input
        type="text"
        name="phone"
        className="form-control"
        value={formData.phone}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Station / Special Unit Name</label>
      <input
        type="text"
        name="stationName"
        className="form-control"
        value={formData.stationName}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Region</label>
      <input
        type="text"
        name="locationRegion"
        className="form-control"
        value={formData.locationRegion}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3">
      <label className="form-label">District</label>
      <input
        type="text"
        name="locationDistrict"
        className="form-control"
        value={formData.locationDistrict}
        onChange={handleChange}
        required
      />
    </div>

    <div className="mb-3">
      <label className="form-label">Police Admin Number</label>
      <input
        type="text"
        name="policeAdminNumber"
        className="form-control"
        value={formData.policeAdminNumber}
        onChange={handleChange}
        required
      />
    </div>

    <button type="submit" className="btn btn-primary">Create Account</button>
  </form>
</div>


);
};

export default StationAccounts;
