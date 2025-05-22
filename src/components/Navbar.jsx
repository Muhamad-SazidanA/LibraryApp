// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, NavDropdown, Button } from 'react-bootstrap';

const customStyles = {
    navbar: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        background: 'linear-gradient(to right, #ffffff, #f8f9fa)',
        padding: '0.75rem 0'
    },
    brand: {
        fontSize: '1.4rem',
        fontWeight: '600',
        color: '#2563eb',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    navLink: {
        color: '#4b5563',
        fontWeight: '500',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        '&:hover': {
            color: '#2563eb',
            background: '#f1f5f9'
        }
    },
    button: {
        borderRadius: '8px',
        padding: '0.5rem 1.25rem',
        fontWeight: '500',
        transition: 'all 0.2s ease'
    }
};

export default function NavigationBar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <Navbar expand="lg" style={customStyles.navbar} fixed="top">
            <Container fluid>
                <Link to="/dashboard" style={customStyles.brand}>
                    <i className="bi bi-book-half"></i>
                    LibraryHub
                </Link>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto gap-2">
                        <Link to="/dashboard" className="nav-link" style={customStyles.navLink}>
                            <i className="bi bi-house-door me-2"></i>
                            Dashboard
                        </Link>

                        {token && (
                            <>
                                <Link to="/mybooks" className="nav-link" style={customStyles.navLink}>
                                    <i className="bi bi-collection me-2"></i>
                                    Collection
                                </Link>

                                <Link to="/members" className="nav-link" style={customStyles.navLink}>
                                    <i className="bi bi-people me-2"></i>
                                    Members
                                </Link>

                                <NavDropdown
                                    title={
                                        <span>
                                            <i className="bi bi-clipboard-check me-2"></i>
                                            Transactions
                                        </span>
                                    }
                                    id="basic-nav-dropdown"
                                >
                                    <NavDropdown.Item as={Link} to="/BorrowPage">
                                        <i className="bi bi-arrow-left-right me-2"></i>
                                        Book Lending
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/DataPinjam">
                                        <i className="bi bi-journal-text me-2"></i>
                                        Lending Records
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/FinesPage">
                                        <i className="bi bi-cash-stack me-2"></i>
                                        Fines Management
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        )}
                    </Nav>

                    <Nav>
                        {token ? (
                            <Button
                                variant="outline-danger"
                                onClick={handleLogout}
                                style={customStyles.button}
                            >
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Sign Out
                            </Button>
                        ) : (
                            <Button
                                variant="primary"
                                as={Link}
                                to="/login"
                                style={customStyles.button}
                            >
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                Sign In
                            </Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
