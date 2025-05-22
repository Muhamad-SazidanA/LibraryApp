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
    },
    badge: {
        padding: "8px 12px",
        borderRadius: "6px"
    }
};

export default function MemberPage() {
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("add");
    const [currentMember, setCurrentMember] = useState({
        no_ktp: "",
        nama: "",
        alamat: "",
        tgl_lahir: "",
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = () => {
        axios
            .get(`${API_URL}/member`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            })
            .then((res) => {
                setMembers(res.data);
            })
            .catch((err) => {
                console.error("Gagal mengambil data member:", err);
            });
    };

    const handleShowModal = (type, member = null) => {
        setModalType(type);
        if (type === "edit" && member) {
            setCurrentMember({ ...member });
        } else {
            setCurrentMember({
                no_ktp: "",
                nama: "",
                alamat: "",
                tgl_lahir: "",
            });
        }
        setShowModal(true);
    };

    const handleShowDetail = (member) => {
        setModalType("detail");
        setCurrentMember({ ...member });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentMember((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url =
            modalType === "add"
                ? `${API_URL}/member`
                : `${API_URL}/member/${currentMember.id}`;
        const method = modalType === "add" ? "POST" : "PUT";

        try {
            const response = await axios({
                method: method,
                url: url,
                data: currentMember,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            // Update list tanpa fetch ulang
            if (modalType === "add") {
                setMembers((prev) => [...prev, response.data]);
            } else {
                setMembers((prev) =>
                    prev.map((m) => (m.id === currentMember.id ? currentMember : m))
                );
            }

            handleCloseModal();
        } catch (err) {
            console.error(`${modalType === "add" ? "Tambah" : "Edit"} anggota gagal`, err);
        }
    };

    const confirmDelete = (member) => {
        setMemberToDelete(member);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/member/${memberToDelete.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });
            setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
            setShowDeleteModal(false);
            setMemberToDelete(null);
        } catch (err) {
            console.error("Gagal menghapus anggota:", err);
            alert("Gagal menghapus anggota.");
        }
    };

    const formatTanggalLahir = (tanggal) => {
        const date = new Date(tanggal);
        const options = { weekday: "long", day: "2-digit", month: "long", year: "numeric" };
        return date.toLocaleDateString("id-ID", options);
    };

    // Sort members by the latest fines or activity date
    const sortedMembers = [...members].sort((a, b) => new Date(b.lastActivityDate || b.createdAt) - new Date(a.lastActivityDate || a.createdAt));

    return (
        <Container fluid className="py-4">
            <Card style={customStyles.card}>
                <Card.Header style={customStyles.cardHeader}>
                    <h4 className="mb-0">Member Management</h4>
                </Card.Header>

                <div className="d-flex justify-content-start align-items-center p-4">
                    <Button
                        variant="primary"
                        onClick={() => handleShowModal("add")}
                        style={customStyles.button}
                    >
                        <i className="bi bi-person-plus me-2"></i>
                        Add New Member
                    </Button>
                </div>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0" style={customStyles.table}>
                            <thead className="bg-light">
                                <tr>
                                    <th>ID Number</th>
                                    <th>Full Name</th>
                                    <th>Address</th>
                                    <th>Date of Birth</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <i className="bi bi-people h3 d-block text-muted"></i>
                                            <p className="text-muted mb-0">No members registered yet</p>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedMembers.map((member) => (
                                        <tr key={member.id} style={customStyles.tableRow}>
                                            <td>
                                                <Badge bg="info" style={customStyles.badge}>
                                                    {member.no_ktp}
                                                </Badge>
                                            </td>
                                            <td className="fw-medium">{member.nama}</td>
                                            <td>{member.alamat}</td>
                                            <td>{formatTanggalLahir(member.tgl_lahir)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    className="me-2"
                                                    style={customStyles.button}
                                                    onClick={() => handleShowDetail(member)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2"
                                                    style={customStyles.button}
                                                    onClick={() => handleShowModal("edit", member)}
                                                >
                                                    <i className="bi bi-pencil me-1"></i>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    style={customStyles.button}
                                                    onClick={() => confirmDelete(member)}
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

            {/* Member Form Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="border-0" style={customStyles.cardHeader}>
                    <Modal.Title>
                        <i className={`bi bi-${modalType === "add" ? "person-plus" : modalType === "edit" ? "person-gear" : "person-badge"} me-2`}></i>
                        {modalType === "add" ? "Add New Member" : modalType === "edit" ? "Edit Member Details" : "Member Information"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {modalType === "detail" ? (
                        <Row className="g-3">
                            <Col md={6}>
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">ID Number</small>
                                    <strong>{currentMember.no_ktp}</strong>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">Full Name</small>
                                    <strong>{currentMember.nama}</strong>
                                </div>
                            </Col>
                            <Col md={12}>
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">Address</small>
                                    <strong>{currentMember.alamat}</strong>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">Date of Birth</small>
                                    <strong>{formatTanggalLahir(currentMember.tgl_lahir)}</strong>
                                </div>
                            </Col>
                        </Row>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group controlId="no_ktp">
                                        <Form.Label>ID Number</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="no_ktp"
                                            value={currentMember.no_ktp}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                            placeholder="Enter national ID number"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group controlId="nama">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nama"
                                            value={currentMember.nama}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                            placeholder="Enter member's full name"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group controlId="alamat">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            name="alamat"
                                            value={currentMember.alamat}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                            placeholder="Enter complete address"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group controlId="tgl_lahir">
                                        <Form.Label>Date of Birth</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="tgl_lahir"
                                            value={currentMember.tgl_lahir}
                                            onChange={handleChange}
                                            required
                                            style={customStyles.input}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end mt-4 gap-2">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleCloseModal}
                                    style={customStyles.button}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    style={customStyles.button}
                                >
                                    {modalType === "add" ? "Add Member" : "Save Changes"}
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
                        Are you sure you want to remove member <strong>{memberToDelete?.nama}</strong>?
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
                        Remove Member
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
