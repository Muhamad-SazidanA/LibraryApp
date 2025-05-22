// src/pages/BookPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import { Modal, Button, Form, Card, Container, Row, Col, Badge } from "react-bootstrap";

const customStyles = {
    card: {
        borderRadius: "12px",
        border: "none",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px"
    },
    cardHeader: {
        background: "linear-gradient(to right, #f8f9fa, #ffffff)",
        borderBottom: "1px solid #eee",
        padding: "16px 20px"
    },
    table: {
        borderCollapse: "separate",
        borderSpacing: "0 8px"
    },
    tableRow: {
        background: "#ffffff",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        transition: "all 0.2s ease"
    },
    button: {
        borderRadius: "8px",
        padding: "8px 16px",
        fontWeight: "500",
        transition: "all 0.2s ease"
    },
    input: {
        borderRadius: "8px",
        border: "1px solid #dee2e6",
        padding: "10px 12px"
    }
};

export default function BookPage() {
    const [books, setBooks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [currentBook, setCurrentBook] = useState({
        no_rak: "",
        judul: "",
        pengarang: "",
        tahun_terbit: "",
        penerbit: "",
        stok: "",
        detail: "",
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await axios.get(`${API_URL}/buku`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            setBooks(res.data);
        } catch (err) {
            console.error("Gagal mengambil data buku:", err);
        }
    };

    const handleShowModal = (type, book = null) => {
        setModalType(type);
        if (type === "edit" && book) {
            setCurrentBook({ ...book });
        } else {
            setCurrentBook({
                no_rak: "",
                judul: "",
                pengarang: "",
                tahun_terbit: "",
                penerbit: "",
                stok: "",
                detail: "",
            });
        }
        setShowModal(true);
    };

    const handleShowDetail = (book) => {
        setModalType("detail");
        setCurrentBook({ ...book });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentBook((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = modalType === "add"
            ? `${API_URL}/buku`
            : `${API_URL}/buku/${currentBook.id}`;
        const method = modalType === "add" ? "POST" : "PUT";

        try {
            const res = await axios({
                method: method,
                url: url,
                data: currentBook,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            if (modalType === "add") {
                setBooks((prev) => [...prev, res.data]);
            } else {
                setBooks((prev) =>
                    prev.map((b) => (b.id === currentBook.id ? currentBook : b))
                );
            }
            handleCloseModal();
        } catch (err) {
            console.error("Gagal menyimpan buku:", err);
        }
    };

    const confirmDelete = (book) => {
        setBookToDelete(book);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/buku/${bookToDelete.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
            setShowDeleteModal(false);
            setBookToDelete(null);
        } catch (err) {
            console.error("Gagal menghapus buku:", err);
        }
    };

    // Sort books by the latest update or fine date
    const sortedBooks = [...books].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    return (
        <Container fluid className="py-4">
            <Card style={customStyles.card}>
                <Card.Header style={customStyles.cardHeader}>
                    <h4 className="mb-0">Book Management</h4>
                </Card.Header>

                <div className="d-flex justify-content-start align-items-center p-4">
                    <Button
                        variant="primary"
                        onClick={() => handleShowModal("add")}
                        style={customStyles.button}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add New Book
                    </Button>
                </div>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0" style={customStyles.table}>
                            <thead className="bg-light">
                                <tr>
                                    <th>Shelf Number</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Year</th>
                                    <th>Publisher</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedBooks.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4">
                                            <i className="bi bi-book h3 d-block text-muted"></i>
                                            <p className="text-muted mb-0">No books available</p>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedBooks.map((book) => (
                                        <tr key={book.id} style={customStyles.tableRow}>
                                            <td>
                                                <Badge bg="info" style={customStyles.badge}>
                                                    {book.no_rak}
                                                </Badge>
                                            </td>
                                            <td className="fw-medium">{book.judul}</td>
                                            <td>{book.pengarang}</td>
                                            <td>{book.tahun_terbit}</td>
                                            <td>{book.penerbit}</td>
                                            <td>
                                                <Badge bg={book.stok > 0 ? "success" : "danger"} style={customStyles.badge}>
                                                    {book.stok > 0 ? `${book.stok} Available` : "Out of Stock"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    className="me-2"
                                                    style={customStyles.button}
                                                    onClick={() => handleShowDetail(book)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    style={customStyles.button}
                                                    onClick={() => handleShowModal("edit", book)}
                                                >
                                                    <i className="bi bi-pencil me-1"></i>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    style={customStyles.button}
                                                    onClick={() => confirmDelete(book)}
                                                >
                                                    <i className="bi bi-trash me-1"></i>
                                                    Remove
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="border-0" style={customStyles.cardHeader}>
                    <Modal.Title>
                        <i className={`bi bi-${modalType === "add" ? "plus-circle" : modalType === "edit" ? "pencil" : "info-circle"} me-2`}></i>
                        {modalType === "add" ? "Add New Book" : modalType === "edit" ? "Edit Book Details" : "Book Information"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {modalType === "detail" ? (
                        <Row>
                            <Col xs={12}>
                                <Card className="border-0 shadow-sm">
                                    <Card.Body>
                                        <h6 className="text-muted mb-3">Book Details</h6>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <p className="mb-1"><strong>Shelf Number:</strong></p>
                                                <p>{currentBook.no_rak}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p className="mb-1"><strong>Title:</strong></p>
                                                <p>{currentBook.judul}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p className="mb-1"><strong>Author:</strong></p>
                                                <p>{currentBook.pengarang}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p className="mb-1"><strong>Publication Year:</strong></p>
                                                <p>{currentBook.tahun_terbit}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p className="mb-1"><strong>Publisher:</strong></p>
                                                <p>{currentBook.penerbit}</p>
                                            </Col>
                                            <Col md={6}>
                                                <p className="mb-1"><strong>Available Stock:</strong></p>
                                                <Badge bg={parseInt(currentBook.stok) > 0 ? "success" : "danger"} pill>
                                                    {currentBook.stok} copies
                                                </Badge>
                                            </Col>
                                            <Col xs={12}>
                                                <p className="mb-1"><strong>Additional Information:</strong></p>
                                                <p className="text-muted">{currentBook.detail || "No additional information available"}</p>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col md={6}>
                                    <Form.Group controlId="no_rak">
                                        <Form.Label>Shelf Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="no_rak"
                                            value={currentBook.no_rak}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                            placeholder="Enter shelf number"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="judul">
                                        <Form.Label>Book Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="judul"
                                            value={currentBook.judul}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                            placeholder="Enter book title"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="pengarang">
                                        <Form.Label>Author</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="pengarang"
                                            value={currentBook.pengarang}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                            placeholder="Enter author name"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="tahun_terbit">
                                        <Form.Label>Publication Year</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="tahun_terbit"
                                            value={currentBook.tahun_terbit}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                            placeholder="Enter publication year"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="penerbit">
                                        <Form.Label>Publisher</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="penerbit"
                                            value={currentBook.penerbit}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                            placeholder="Enter publisher name"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="stok">
                                        <Form.Label>Stock</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="stok"
                                            value={currentBook.stok}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                            placeholder="Enter stock quantity"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group controlId="detail">
                                        <Form.Label>Additional Information</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="detail"
                                            value={currentBook.detail}
                                            onChange={handleChange}
                                            style={customStyles.input}
                                            placeholder="Enter additional book details (optional)"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end mt-4">
                                <Button variant="secondary" className="me-2" onClick={handleCloseModal} style={customStyles.button}>
                                    Cancel
                                </Button>
                                <Button variant="primary" type="submit" style={customStyles.button}>
                                    {modalType === "add" ? "Add Book" : "Save Changes"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>
                        <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                        Confirm Removal
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">
                        Are you sure you want to remove the book <strong>{bookToDelete?.judul}</strong>?
                        This action cannot be undone.
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowDeleteModal(false)}
                        style={customStyles.button}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        style={customStyles.button}
                    >
                        Remove Book
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
