// src/components/common/DistrictSidebar.js
import React, { useState } from "react";
import { FaHome, FaUsers, FaClipboardList, FaFileAlt, FaChartBar, FaComments, FaUserCog } from "react-icons/fa";

const DistrictSidebar = ({ active, setActive }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Overview", icon: <FaHome /> },
    { name: "Accounts", icon: <FaUsers /> },
    { name: "Station Requests", icon: <FaClipboardList /> },
    { name: "District Request Form", icon: <FaFileAlt /> },
    { name: "Reports", icon: <FaChartBar /> },
    { name: "Chat", icon: <FaComments /> },
    { name: "Account Settings", icon: <FaUserCog /> },
  ];

  return (
    <div
      className="d-flex flex-column bg-white p-3 border-end"
      style={{ width: collapsed ? "60px" : "250px", minHeight: "100vh", transition: "width 0.3s" }}
    >
      {/* Toggle button */}
      <button
        className="btn btn-outline-primary mb-3 d-md-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "☰" : "×"}
      </button>

      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map((item) => (
          <li key={item.name} className="nav-item mb-1">
            <button
              className={`nav-link w-100 text-start d-flex align-items-center gap-2 ${
                active === item.name
                  ? "active bg-primary text-white"
                  : "text-primary"  // <-- make inactive links blue
              }`}
              onClick={() => setActive(item.name)}
              style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              <span>{item.icon}</span>
              {!collapsed && item.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-auto text-center small text-muted">
        {!collapsed && "v1.0 DPAMIS"}
      </div>
    </div>
  );
};

export default DistrictSidebar;
