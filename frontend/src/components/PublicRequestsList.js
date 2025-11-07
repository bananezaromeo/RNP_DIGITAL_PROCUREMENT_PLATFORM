import React, { useEffect, useState } from 'react';
import { fetchPublicRequests } from '../services/api';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import './PublicRequestsList.css';
import { Link } from 'react-router-dom';

export default function PublicRequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchPublicRequests();
        setRequests(res.data);
      } catch (err) {
        setError('Failed to load public requests');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" />
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <Container className="py-5">
      <Row className="mb-4 align-items-center">
        <Col md={8}>
          <h2 className="mb-0">Current Procurement Opportunities</h2>
          <p className="text-muted">Posted aggregated weekly by DPAMIS Procurement Team</p>
        </Col>
        <Col md={4} className="text-md-end">
        <Link to="/supplier-register" className="btn btn-primary">Register to Bid</Link>

        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4">
        {requests.length === 0 && (
          <Col>
            <div className="alert alert-info">No open procurement requests at the moment.</div>
          </Col>
        )}

        {requests.map((r) => (
          <Col key={r._id}>
            <Card className="h-100 request-card shadow-sm">
              <Card.Body>
                <Card.Title>{r.productName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Required by: {new Date(r.requiredBy).toLocaleDateString()}
                </Card.Subtitle>

                <div className="d-flex justify-content-between align-items-end mt-4">
                  <div>
                    <h3 className="mb-0">{r.totalQuantityKg.toLocaleString()} kg</h3>
                    <small className="text-muted">Status: {r.status}</small>
                  </div>
                  <Button variant="outline-primary" href="/supplier-register">Register</Button>
                </div>
              </Card.Body>
              <Card.Footer className="text-muted small">
                Posted: {new Date(r.postedAt).toLocaleDateString()}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
