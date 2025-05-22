import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import { API_URL } from "../../constant";
import {
    Container,
    Card,
    Button,
    Row,
    Col,
    Badge,
    Modal,
    ListGroup,
    Spinner,
} from "react-bootstrap";
import jsPDF from "jspdf";

const customStyles = {
    card: {
        borderRadius: "12px",
        border: "none",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px",
        transition: "transform 0.2s ease",
        width: "100%",
        flex: "1 1 auto",
        "&:hover": {
            transform: "translateY(-5px)",
        },
    },
    cardHeader: {
        background: "linear-gradient(to right, #f8f9fa, #ffffff)",
        borderBottom: "1px solid #eee",
        padding: "16px 20px",
    },
    statCard: {
        textAlign: "center",
        padding: "12px",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
        marginBottom: "12px",
    },
    badge: {
        padding: "8px 12px",
        borderRadius: "6px",
        fontWeight: "500",
    },
    button: {
        borderRadius: "8px",
        padding: "8px 16px",
        fontWeight: "500",
        transition: "all 0.2s ease",
    },
    listItem: {
        borderRadius: "8px",
        marginBottom: "8px",
        padding: "16px",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
};

export default function DataPinjam() {
    const [peminjaman, setPeminjaman] = useState([]);
    const [members, setMembers] = useState([]);
    const [dendaList, setDendaList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        if (token) {
            fetchAllData();
        }
    }, [token]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [pinjamRes, memberRes, dendaRes] = await Promise.all([
                axios.get(`${API_URL}/peminjaman`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_URL}/member`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_URL}/denda`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setPeminjaman(pinjamRes.data?.data || []);
            setMembers(memberRes.data || []);
            setDendaList(dendaRes.data?.data || []);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Gagal memuat data", "error");
        }
        setLoading(false);
    };

    const getMemberStats = (memberId) => {
        const pinjamMember = peminjaman.filter((p) => p.id_member === memberId);
        const sedangDipinjam = pinjamMember.filter((p) => !p.status_pengembalian).length;
        const sudahDikembalikan = pinjamMember.filter((p) => p.status_pengembalian).length;
        const totalDendaCount = dendaList.filter((d) => d.id_member === memberId).length;

        return { sedangDipinjam, sudahDikembalikan, totalDendaCount };
    };

    const getPeminjamanByMember = (memberId) =>
        peminjaman.filter((p) => p.id_member === memberId);

    const getDendaForPinjam = (pinjam) =>
        dendaList.filter(
            (d) => d.id_member === pinjam.id_member && d.id_buku === pinjam.id_buku
        );

    const openDetailModal = (member) => {
        setSelectedMember(member);
        setShowDetailModal(true);
    };

    const closeDetailModal = () => {
        setSelectedMember(null);
        setShowDetailModal(false);
    };

    const exportToPDF = () => {
        if (!selectedMember) return;

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`${selectedMember.nama}'s Activity History`, 10, 10);

        let y = 20;
        doc.setFontSize(12);
        doc.text("Member Information:", 10, y);
        y += 10;
        doc.text(`Full Name: ${selectedMember.nama}`, 10, y);
        y += 10;
        doc.text(`Member ID: ${selectedMember.id}`, 10, y);

        y += 20;
        doc.text("Borrowing History:", 10, y);
        y += 10;

        const borrowings = getPeminjamanByMember(selectedMember.id);
        if (borrowings.length === 0) {
            doc.text("No borrowing history found.", 10, y);
        } else {
            borrowings.forEach((item, index) => {
                const statusText = item.status_pengembalian
                    ? "Returned"
                    : moment().isAfter(moment(item.tgl_pengembalian))
                        ? "Overdue"
                        : "Borrowed";

                y += 10;
                doc.text(`${index + 1}. Book ID: ${item.id_buku}`, 10, y);
                y += 10;
                doc.text(`   Borrowed: ${moment(item.tgl_pinjam).format("MMM DD, YYYY")}`, 10, y);
                y += 10;
                doc.text(`   Due: ${moment(item.tgl_pengembalian).format("MMM DD, YYYY")}`, 10, y);
                y += 10;
                doc.text(`   Status: ${statusText}`, 10, y);

                const fines = getDendaForPinjam(item);
                if (fines.length > 0) {
                    y += 10;
                    doc.text("   Fines:", 10, y);
                    fines.forEach((fine) => {
                        y += 10;
                        doc.text(`      - ${fine.jenis_denda}: Rp ${Number(fine.jumlah_denda).toLocaleString("id-ID")}`, 10, y);
                    });
                }
            });
        }

        doc.save(`${selectedMember.nama}_Activity_History.pdf`);
    };

    if (!token) {
        return (
            <Container className="mt-4 text-center">
                <Card style={customStyles.card}>
                    <Card.Body>
                        <i className="bi bi-shield-lock h3 mb-3"></i>
                        <h5>Please login to access this page</h5>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container className="mt-4 text-center">
                <Card style={customStyles.card}>
                    <Card.Body className="py-5">
                        <Spinner animation="border" variant="primary" className="mb-3" />
                        <div>Loading member activities...</div>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // Sort dendaList by the latest fine date
    const sortedDendaList = [...dendaList].sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));

    return (<Container fluid className="py-4">
        <Card style={customStyles.card}>
            <Card.Header style={customStyles.cardHeader}>
                <h4 className="mb-0">
                    <i className="bi bi-activity me-2"></i>
                    Member Activity Dashboard
                </h4>
            </Card.Header>
            <Card.Body>
                <Row xs={1} sm={2} md={2} lg={2} xl={2} className="g-4 justify-content-start">
                    {members.length === 0 ? (
                        <Col>
                            <div className="text-center py-5">
                                <i className="bi bi-people h1 text-muted"></i>
                                <p className="mt-3">No members found</p>
                            </div>
                        </Col>
                    ) : (
                        members.map((member) => {
                            const { sedangDipinjam, sudahDikembalikan, totalDendaCount } = getMemberStats(member.id);
                            return (
                                <Col key={member.id}>
                                    <Card className="h-100" style={customStyles.card}>
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <h5 className="mb-1">{member.nama}</h5>
                                                    <small className="text-muted">ID: {member.id}</small>
                                                </div>
                                                <Badge bg="info" style={customStyles.badge}>
                                                    Active Member
                                                </Badge>
                                            </div>

                                            <Row className="g-2 mb-3">
                                                <Col xs={4}>
                                                    <div style={customStyles.statCard}>
                                                        <div className="small text-muted mb-1">Current</div>
                                                        <h5 className="mb-0">
                                                            <Badge bg="warning" text="dark" style={customStyles.badge}>
                                                                {sedangDipinjam}
                                                            </Badge>
                                                        </h5>
                                                    </div>
                                                </Col>
                                                <Col xs={4}>
                                                    <div style={customStyles.statCard}>
                                                        <div className="small text-muted mb-1">Returned</div>
                                                        <h5 className="mb-0">
                                                            <Badge bg="success" style={customStyles.badge}>
                                                                {sudahDikembalikan}
                                                            </Badge>
                                                        </h5>
                                                    </div>
                                                </Col>
                                                <Col xs={4}>
                                                    <div style={customStyles.statCard}>
                                                        <div className="small text-muted mb-1">Fines</div>
                                                        <h5 className="mb-0">
                                                            <Badge
                                                                bg={totalDendaCount > 0 ? "danger" : "secondary"}
                                                                style={customStyles.badge}
                                                            >
                                                                {totalDendaCount}
                                                            </Badge>
                                                        </h5>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Button
                                                variant="outline-primary"
                                                onClick={() => openDetailModal(member)}
                                                className="w-100"
                                                style={customStyles.button}
                                            >
                                                <i className="bi bi-list-ul me-2"></i>
                                                View Activity History
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })
                    )}
                </Row>
            </Card.Body>
        </Card>

        <Modal
            show={showDetailModal}
            onHide={closeDetailModal}
            size="lg"
            centered
            scrollable
        >
            <Modal.Header closeButton className="border-0" style={customStyles.cardHeader}>
                <Modal.Title>
                    <i className="bi bi-person-badge me-2"></i>
                    {selectedMember?.nama}'s Activity History
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                {selectedMember ? (
                    <>
                        <div className="mb-4">
                            <h6 className="text-muted mb-3">Member Information</h6>
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block">Full Name</small>
                                        <strong>{selectedMember.nama}</strong>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded">
                                        <small className="text-muted d-block">Member ID</small>
                                        <strong>{selectedMember.id}</strong>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        <h6 className="text-muted mb-3">Borrowing History</h6>
                        <ListGroup variant="flush">
                            {getPeminjamanByMember(selectedMember.id).length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="bi bi-inbox h3 d-block text-muted"></i>
                                    <p className="text-muted">No borrowing history found</p>
                                </div>
                            ) : (
                                getPeminjamanByMember(selectedMember.id).map((item) => {
                                    const statusText = item.status_pengembalian
                                        ? "Returned"
                                        : moment().isAfter(moment(item.tgl_pengembalian))
                                            ? "Overdue"
                                            : "Borrowed";
                                    const statusVariant = item.status_pengembalikan
                                        ? "success"
                                        : moment().isAfter(moment(item.tgl_pengembalian))
                                            ? "danger"
                                            : "warning";

                                    const dendaPinjam = getDendaForPinjam(item);

                                    return (
                                        <ListGroup.Item key={item.id} style={customStyles.listItem}>
                                            <Row className="align-items-center">
                                                <Col>
                                                    <div className="mb-2">
                                                        <Badge bg={statusVariant} style={customStyles.badge}>
                                                            {statusText}
                                                        </Badge>
                                                    </div>
                                                    <p className="mb-1">
                                                        <strong>Book ID:</strong> {item.id_buku}
                                                    </p>
                                                    <p className="mb-1">
                                                        <small className="text-muted">
                                                            Borrowed: {moment(item.tgl_pinjam).format("MMM DD, YYYY")}
                                                        </small>
                                                    </p>
                                                    <p className="mb-0">
                                                        <small className="text-muted">
                                                            Due: {moment(item.tgl_pengembalian).format("MMM DD, YYYY")}
                                                        </small>
                                                    </p>
                                                </Col>
                                            </Row>

                                            {dendaPinjam.length > 0 && (
                                                <div className="mt-3 pt-3 border-top">
                                                    <h6 className="text-muted mb-2">Fine History</h6>
                                                    <ListGroup variant="flush">
                                                        {dendaPinjam.map((denda, i) => (
                                                            <ListGroup.Item
                                                                key={i}
                                                                className="px-0 py-2 border-0"
                                                            >
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <Badge
                                                                            bg="danger"
                                                                            style={customStyles.badge}
                                                                            className="me-2"
                                                                        >
                                                                            {denda.jenis_denda.toUpperCase()}
                                                                        </Badge>
                                                                        <span className="text-muted">
                                                                            {denda.deskripsi}
                                                                        </span>
                                                                    </div>
                                                                    <strong>
                                                                        Rp {Number(denda.jumlah_denda).toLocaleString("id-ID")}
                                                                    </strong>
                                                                </div>
                                                            </ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                </div>
                                            )}
                                        </ListGroup.Item>
                                    );
                                })
                            )}
                        </ListGroup>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 mb-0">Loading activity details...</p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button
                    variant="secondary"
                    onClick={closeDetailModal}
                    style={customStyles.button}
                >
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={exportToPDF}
                    style={customStyles.button}
                >
                    Export To PDF
                </Button>
            </Modal.Footer>
        </Modal>
    </Container>
    );
}
