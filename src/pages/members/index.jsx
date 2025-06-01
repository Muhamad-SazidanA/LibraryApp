import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import { Modal, Button, Form, Card, Container, Row, Col, Badge } from "react-bootstrap";

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

    const sortedMembers = [...members].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <Container fluid className="py-4">
            <Card className="shadow-lg border-0 rounded-4 mb-4">
                <Card.Header className="bg-secondary text-light rounded-top-4 text-center">
                    <h2 className="mb-0">Manajemen Anggota</h2>
                </Card.Header>
                <div className="d-flex justify-content-start align-items-center p-4">
                    <Button
                        variant="secondary"
                        onClick={() => handleShowModal("add")}
                        className="rounded-3 fw-semibold"
                    >
                        <i className="bi bi-person-plus me-2"></i>
                        Add Member
                    </Button>
                </div>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle text-center">
                            <thead className="bg-light">
                                <tr>
                                    <th className="text-center">No KTP</th>
                                    <th className="text-center">Nama Lengkap</th>
                                    <th className="text-center">Alamat</th>
                                    <th className="text-center">Tanggal Lahir</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <i className="bi bi-people h3 d-block text-muted"></i>
                                            <p className="text-muted mb-0">Belum ada anggota terdaftar</p>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedMembers.map((member) => (
                                        <tr key={member.id}>
                                            <td className="align-middle text-center" style={{ maxWidth: 120, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                                                <Badge bg="secondary" className="rounded-pill px-3 py-2">
                                                    {member.no_ktp}
                                                </Badge>
                                            </td>
                                            <td className="align-middle text-center" style={{ maxWidth: 160, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                                                {member.nama}
                                            </td>
                                            <td className="align-middle text-center" style={{ maxWidth: 180, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                                                {member.alamat}
                                            </td>
                                            <td className="align-middle text-center" style={{ maxWidth: 160, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                                                {formatTanggalLahir(member.tgl_lahir)}
                                            </td>
                                            <td className="align-middle text-center">
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    className="me-2 rounded-3"
                                                    onClick={() => handleShowDetail(member)}
                                                >
                                                    <i className="bi bi-eye me-1"></i>
                                                    Detail
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-2 rounded-3"
                                                    onClick={() => handleShowModal("edit", member)}
                                                >
                                                    <i className="bi bi-pencil me-1"></i>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="rounded-3"
                                                    onClick={() => confirmDelete(member)}
                                                >
                                                    <i className="bi bi-trash me-1"></i>
                                                    Hapus
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

            {/* Modal Form Anggota */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="border-0 text-black">
                    <Modal.Title>
                        <i className={`bi bi-${modalType === "add" ? "person-plus" : modalType === "edit" ? "person-gear" : "person-badge"} me-2`}></i>
                        {modalType === "add" ? "Add New Member" : modalType === "edit" ? "Edit Data Anggota" : "Detail Anggota"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {modalType === "detail" ? (
                        <Row className="g-3">
                            <Col md={6}>
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">No KTP</small>
                                    <strong>{currentMember.no_ktp}</strong>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">Nama Lengkap</small>
                                    <strong>{currentMember.nama}</strong>
                                </div>
                            </Col>
                            <Col md={12}>
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">Alamat</small>
                                    <strong>{currentMember.alamat}</strong>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className="p-3 bg-light rounded">
                                    <small className="text-muted d-block mb-1">Tanggal Lahir</small>
                                    <strong>{formatTanggalLahir(currentMember.tgl_lahir)}</strong>
                                </div>
                            </Col>
                        </Row>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Row className="g-3">
                                <Col md={12}>
                                    <Form.Group controlId="no_ktp">
                                        <Form.Label>No KTP</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="no_ktp"
                                            value={currentMember.no_ktp}
                                            onChange={handleChange}
                                            required
                                            className="rounded-3"
                                            placeholder="Masukkan nomor KTP"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group controlId="nama">
                                        <Form.Label>Nama Lengkap</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="nama"
                                            value={currentMember.nama}
                                            onChange={handleChange}
                                            required
                                            className="rounded-3"
                                            placeholder="Masukkan nama lengkap anggota"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group controlId="alamat">
                                        <Form.Label>Alamat</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            name="alamat"
                                            value={currentMember.alamat}
                                            onChange={handleChange}
                                            required
                                            className="rounded-3"
                                            placeholder="Masukkan alamat lengkap"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={12}>
                                    <Form.Group controlId="tgl_lahir">
                                        <Form.Label>Tanggal Lahir</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="tgl_lahir"
                                            value={currentMember.tgl_lahir}
                                            onChange={handleChange}
                                            required
                                            className="rounded-3"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-end mt-4 gap-2">
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleCloseModal}
                                    className="rounded-3"
                                >
                                    Batal
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="rounded-3"
                                >
                                    {modalType === "add" ? "Tambah Anggota" : "Simpan Perubahan"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>
                        <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                        Konfirmasi Penghapusan
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-0">
                        Apakah Anda yakin ingin menghapus anggota <strong>{memberToDelete?.nama}</strong>?<br />
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowDeleteModal(false)}
                        className="rounded-3"
                    >
                        Batal
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        className="rounded-3"
                    >
                        Hapus Anggota
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}