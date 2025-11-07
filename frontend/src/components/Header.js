import React from "react";
import { Navbar, Container } from "react-bootstrap";

const Header = () => (
  <Navbar bg="light" expand="lg" className="shadow-sm mb-3">
    <Container fluid>
      <Navbar.Brand className="fw-bold text-primary">Station Dashboard</Navbar.Brand>
      <Navbar.Text>Welcome, Station Admin</Navbar.Text>
    </Container>
  </Navbar>
);

export default Header;


