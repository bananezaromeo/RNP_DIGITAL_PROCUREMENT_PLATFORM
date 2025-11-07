// src/components/common/DistrictHeader.js
import React from "react";
import { Navbar, Container } from "react-bootstrap";
const DistrictHeader = () => (
  <Navbar bg="light" expand="lg" className="shadow-sm mb-3">
    <Container fluid>
      <Navbar.Brand className="fw-bold text-primary">District Dashboard</Navbar.Brand>
      <Navbar.Text>Welcome, District Admin</Navbar.Text>
    </Container>
  </Navbar>
);

export default DistrictHeader;
