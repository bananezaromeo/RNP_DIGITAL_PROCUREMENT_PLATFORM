// src/components/Sidebar.js
import React, { useState } from "react";
import { 
  FaHome, FaPaperPlane, FaListAlt, FaComments, FaFilePdf, FaUserCog, 
  FaUsers, FaBoxes 
} from "react-icons/fa";

const Sidebar = ({ active, setActive, role = "station" }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Menu items depending on role
  const baseMenu = [
    { label: "Overview", icon: <FaHome /> },
    { label: "Submit Request", icon: <FaPaperPlane /> },
    { label: "My Requests", icon: <FaListAlt /> },
    { label: "Chat", icon: <FaComments /> },
    { label: "Reports", icon: <FaFilePdf /> },
    { label: "Account Settings", icon: <FaUserCog /> }
  ];

  const districtMenu = [
    { label: "Create Accounts", icon: <FaUsers /> },
    { label: "Aggregate Requests", icon: <FaBoxes /> },
    ...baseMenu
  ];

  const menuItems = role === "district" ? districtMenu : baseMenu;

  return (
    <div className={`d-flex flex-column flex-shrink-0 p-3 bg-white border-end`} 
         style={{ width: collapsed ? "60px" : "220px", transition: "width 0.3s" }}>

      {/* Toggle Button */}
      <button 
        className="btn btn-outline-primary mb-3 d-md-none" 
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "☰" : "×"}
      </button>

      <ul className="nav nav-pills flex-column mb-auto">
        {menuItems.map(item => (
          <li key={item.label} className="nav-item mb-1">
            <button
              className={`nav-link w-100 text-start d-flex align-items-center ${active === item.label ? "active bg-primary text-white" : ""}`}
              onClick={() => setActive(item.label)}
              style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              <span className="me-2">{item.icon}</span>
              {!collapsed && item.label}
              {collapsed && item.label[0]} {/* show first letter when collapsed */}
            </button>
          </li>
        ))}
      </ul>

      {/* Footer / Version */}
      <div className="mt-auto text-center small text-muted">
        {!collapsed && "v1.0 DPAMIS"}
      </div>
    </div>
  );
};

export default Sidebar;
