import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, NavDropdown, Button } from 'react-bootstrap';

export default function NavigationBar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <Navbar expand="lg" bg="dark" variant="dark" className="shadow-sm" fixed="top">
            <Container>
                <Link to="/dashboard" className="navbar-brand d-flex align-items-center gap-2">
                    <i className="bi bi-book-half"></i>
                    <span>LibraryHub</span>
                </Link>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="me-auto">
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        {token && (
                            <>
                                <Link to="/mybooks" className="nav-link">Collection</Link>
                                <Link to="/members" className="nav-link">Members</Link>
                                <NavDropdown title="Transactions" id="nav-dropdown">
                                    <NavDropdown.Item as={Link} to="/BorrowPage">Book Lending</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/DataPinjam">Lending Records</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/FinesPage">Fines Management</NavDropdown.Item>
                                </NavDropdown>
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {token ? (
                            <Button variant="outline-light" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right me-2"></i>
                                Sign Out
                            </Button>
                        ) : (
                            <Button variant="primary" as={Link} to="/login">
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