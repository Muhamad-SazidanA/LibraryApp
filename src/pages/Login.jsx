import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Card, Row, Col, Alert } from 'react-bootstrap';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://45.64.100.26:88/perpus-api/public/api/login', {
                email,
                password
            });
            if (response.data.token) {
                localStorage.setItem('access_token', response.data.token);
                navigate('/dashboard');
            }
        } catch (error) {
            setError('Invalid credentials. Please check your email and password.');
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e293b 0%, #2563eb 100%)" }}>
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={5} lg={4}>
                        <Card className="shadow-lg border-0 rounded-4">
                            <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                    <i className="bi bi-book h1 text-secondary mb-3"></i>
                                    <h3 className="mb-2">Welcome Back</h3>
                                    <p className="text-muted">Library Management System</p>
                                </div>
                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        {error}
                                    </Alert>
                                )}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="Enter your email"
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Enter your password"
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                    <Button
                                        type="submit"
                                        className="w-100 mb-3 rounded-3"
                                        variant="secondary"
                                        style={{ fontWeight: 600, letterSpacing: 1 }}
                                    >
                                        <i className="bi bi-box-arrow-in-right me-2"></i>
                                        Sign In
                                    </Button>
                                    <p className="text-center text-muted mb-0">
                                        <small>
                                            Protected access for library staff only
                                        </small>
                                    </p>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}