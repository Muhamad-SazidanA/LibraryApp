// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Card, Row, Col, Alert } from 'react-bootstrap';

const customStyles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    },
    card: {
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        overflow: 'hidden'
    },
    cardBody: {
        padding: '2.5rem'
    },
    input: {
        borderRadius: '8px',
        padding: '12px',
        border: '1px solid #e0e0e0',
        transition: 'all 0.2s ease',
        '&:focus': {
            borderColor: '#4a90e2',
            boxShadow: '0 0 0 3px rgba(74,144,226,0.1)'
        }
    },
    button: {
        borderRadius: '8px',
        padding: '12px',
        fontWeight: '600',
        transition: 'all 0.2s ease',
        background: 'linear-gradient(45deg, #4a90e2 0%, #357abd 100%)',
        border: 'none',
        boxShadow: '0 4px 6px rgba(74,144,226,0.2)',
        '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 8px rgba(74,144,226,0.25)'
        }
    }
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://45.64.100.26:88/perpus-api/public/api/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('access_token', response.data.token);
                navigate('/dashboard');
            }
        } catch (error) {
            setError('Invalid credentials. Please check your email and password.');
        }
    };

    return (
        <div style={customStyles.container}>
            <Container>
                <Row className="justify-content-center">
                    <Col xs={12} md={5} lg={4}>
                        <Card style={customStyles.card}>
                            <Card.Body style={customStyles.cardBody}>
                                <div className="text-center mb-4">
                                    <i className="bi bi-book h1 text-primary mb-3"></i>
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
                                            style={customStyles.input}
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
                                            style={customStyles.input}
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="w-100 mb-3"
                                        style={customStyles.button}
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
