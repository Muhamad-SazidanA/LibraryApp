import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import moment from "moment";
import Swal from "sweetalert2";
import {
    Container, Row, Col, Form, Button, Card,
    Badge, Modal, Spinner, ListGroup
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

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
    form: {
        padding: "24px"
    },
    input: {
        borderRadius: "8px",
        border: "1px solid #dee2e6",
        padding: "10px 12px"
    },
    button: {
        borderRadius: "8px",
        padding: "10px 16px",
        fontWeight: "500"
    },
    badge: {
        padding: "8px 12px",
        borderRadius: "6px"
    },
    table: {
        borderCollapse: "separate",
        borderSpacing: "0 8px"
    }
};

export default function FinesPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");

    const [form, setForm] = useState({
        id_member: "",
        id_buku: "",
        jumlah_denda: "",
        jenis_denda: "",
        deskripsi: "",
    });

    const [extraFines, setExtraFines] = useState([]);
    const [peminjaman, setPeminjaman] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [denda, setDenda] = useState([]);
    const [fines, setFines] = useState([]);
    const [selected, setSelected] = useState(null);
    const [detailModal, setDetailModal] = useState(false);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token]);

    async function loadData() {
        try {
            const [pj, bk, mb, dn] = await Promise.all([
                axios.get(`${API_URL}/peminjaman`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/buku`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/member`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/denda`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            setPeminjaman(pj.data?.data || []);
            setBooks(bk.data?.data || bk.data || []);
            setMembers(mb.data?.data || mb.data || []);
            setDenda(dn.data?.data || []);
        } catch (err) {
            Swal.fire("Error", "Gagal memuat data", "error");
        }
    }

    function getMemberName(id) {
        const member = members.find(m => m.id === id);
        return member ? member.nama : "Unknown";
    }

    function getMemberDetail(id) {
        const member = members.find(m => m.id === id);
        return member || {};
    }

    function getBookTitle(id) {
        const book = books.find(b => b.id === id);
        return book ? book.judul : "Unknown";
    }

    function getBookDetail(id) {
        const book = books.find(b => b.id === id);
        return book || {};
    }

    const getDendaList = (mid, bid) => denda.filter(x => x.id_member === mid && x.id_buku === bid);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prev => {
            if (name === "jenis_denda" && value !== "terlambat") {
                return { ...prev, jenis_denda: value, jumlah_denda: "", deskripsi: "" };
            }
            return { ...prev, [name]: value };
        });
    }

    function addExtraFine() {
        if (!form.jenis_denda || !form.jumlah_denda || !form.deskripsi) {
            return Swal.fire("Peringatan", "Lengkapi jenis, jumlah, dan deskripsi denda!", "warning");
        }
        setExtraFines(prev => [...prev, {
            id_member: form.id_member,
            id_buku: form.id_buku,
            jenis_denda: form.jenis_denda,
            jumlah_denda: form.jumlah_denda,
            deskripsi: form.deskripsi,
        }]);
        setForm(prev => ({ ...prev, jenis_denda: "", jumlah_denda: "", deskripsi: "" }));
    }

    function removeExtraFine(index) {
        setExtraFines(prev => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const { id_member, id_buku, jumlah_denda, jenis_denda, deskripsi } = form;
        if (!id_member || !id_buku) {
            return Swal.fire("Peringatan", "Mohon isi semua field wajib", "warning");
        }
        try {
            await axios.post(
                `${API_URL}/peminjaman`,
                { id_member, id_buku },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const finesToSave = [...extraFines];
            if (jenis_denda && jumlah_denda && deskripsi) {
                finesToSave.unshift({ id_member, id_buku, jumlah_denda, jenis_denda, deskripsi });
            }

            for (const fine of finesToSave) {
                await axios.post(`${API_URL}/denda`, fine, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            Swal.fire("Sukses", "Data berhasil disimpan", "success");
            setForm({ id_member: "", id_buku: "", jumlah_denda: "", jenis_denda: "", deskripsi: "" });
            setExtraFines([]);
            loadData(); // Auto-reload data setelah input berhasil
        } catch (err) {
            Swal.fire("Error", "Gagal menyimpan data", "error");
        }
    }

    const filteredFines = fines.filter(fine => {
        const memberName = fine.member.name.toLowerCase();
        const memberId = fine.member.id.toLowerCase();
        const searchTerm = search.toLowerCase();
        return (
            memberName.includes(searchTerm) ||
            memberId.includes(searchTerm)
        );
    }).filter(fine => {
        if (status === "") return true;
        return fine.status === status;
    });

    // Sort fines data by date to show the latest fines at the top
    const sortedFines = [...fines].sort((a, b) => new Date(b.due_date) - new Date(a.due_date));

    return (
        <Container fluid className="py-4">
            <Card className="mb-4 shadow-sm" style={customStyles.card}>
                <Card.Header style={customStyles.cardHeader}>
                    <h4 className="mb-0">Form Denda Peminjaman</h4>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <i className="bi bi-person me-1"></i>
                                        Member
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="id_member"
                                        value={form.id_member}
                                        onChange={handleChange}
                                        required
                                        className="shadow-sm"
                                    >
                                        <option value="">-- Pilih Member --</option>
                                        {members.length === 0 && (
                                            <option disabled>Tidak ada data member tersedia</option>
                                        )}
                                        {members.map(m => (
                                            <option key={m.id} value={m.id}>{m.nama}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Pilih member yang akan dikenakan denda
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <i className="bi bi-book me-1"></i>
                                        Buku
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="id_buku"
                                        value={form.id_buku}
                                        onChange={handleChange}
                                        required
                                        className="shadow-sm"
                                    >
                                        <option value="">-- Pilih Buku --</option>
                                        {books.length === 0 && (
                                            <option disabled>Tidak ada data buku tersedia</option>
                                        )}
                                        {books.map(b => (
                                            <option key={b.id} value={b.id}>{b.judul}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Pilih buku yang terkait dengan denda
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <i className="bi bi-currency-dollar me-1"></i>
                                        Jumlah Denda
                                        {form.jenis_denda === 'terlambat' && (
                                            <Badge bg="info" className="ms-2">Otomatis: Rp1.500/hari</Badge>
                                        )}
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="jumlah_denda"
                                        value={form.jumlah_denda}
                                        onChange={handleChange}
                                        min={0}
                                        className="shadow-sm"
                                        placeholder="Masukkan jumlah denda"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <i className="bi bi-tag me-1"></i>
                                        Jenis Denda
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="jenis_denda"
                                        value={form.jenis_denda}
                                        onChange={handleChange}
                                        required
                                        className="shadow-sm"
                                    >
                                        <option value="">-- Pilih Jenis --</option>
                                        <option value="terlambat">Keterlambatan</option>
                                        <option value="kerusakan">Kerusakan Buku</option>
                                        <option value="kehilangan">Kehilangan Buku</option>
                                        <option value="lainnya">Lainnya</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <i className="bi bi-card-text me-1"></i>
                                        Deskripsi
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={1}
                                        name="deskripsi"
                                        value={form.deskripsi}
                                        onChange={handleChange}
                                        className="shadow-sm"
                                        placeholder="Tambahkan keterangan denda"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-center gap-2 mt-5">
                            <Button
                                variant="outline-primary"
                                type="button"
                                onClick={addExtraFine}
                                disabled={!form.jenis_denda || !form.jumlah_denda}
                                style={customStyles.button}
                            >
                                <i className="bi bi-plus-circle me-1"></i>
                                Tambah Denda Lain
                            </Button>
                            <Button type="submit" variant="primary" style={customStyles.button}>
                                <i className="bi bi-save me-1"></i>
                                Simpan Denda
                            </Button>
                        </div>

                        {extraFines.length > 0 && (
                            <div className="mt-3">
                                <h6>Denda Tambahan:</h6>
                                <ListGroup variant="flush">
                                    {extraFines.map((fine, idx) => (
                                        <ListGroup.Item
                                            key={idx}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <Badge bg="secondary" className="me-2">
                                                    {fine.jenis_denda}
                                                </Badge>
                                                Rp {Number(fine.jumlah_denda).toLocaleString('id-ID')} -
                                                {fine.deskripsi}
                                            </div>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => removeExtraFine(idx)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        )}
                    </Form>
                </Card.Body>
            </Card>

            <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-white d-flex justify-content-between align-items-center">
                    <div>
                        <i className="bi bi-list-check me-2"></i>
                        Daftar Peminjaman & Denda
                    </div>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0" style={customStyles.table}>
                            <thead className="bg-light">
                                <tr>
                                    <th>Member</th>
                                    <th>Buku</th>
                                    <th>Total Denda</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedFines.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <i className="bi bi-inbox h3 d-block"></i>
                                            Tidak ada data peminjaman
                                        </td>
                                    </tr>
                                ) : (
                                    sortedFines.map(item => {
                                        const list = getDendaList(item.id_member, item.id_buku);
                                        const totalDenda = list.reduce((acc, curr) =>
                                            acc + Number(curr.jumlah_denda), 0
                                        );
                                        return (
                                            <tr key={item.id}>
                                                <td>{getMemberName(item.id_member)}</td>
                                                <td>{getBookTitle(item.id_buku)}</td>
                                                <td>Rp {totalDenda.toLocaleString('id-ID')}</td>
                                                <td>{item.status}</td>
                                                <td>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelected(item);
                                                            setDetailModal(true);
                                                        }}
                                                    >
                                                        Detail
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            <Modal
                show={detailModal}
                onHide={() => setDetailModal(false)}
                size="lg"
                centered
                scrollable
            >
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>
                        <i className="bi bi-info-circle me-2"></i>
                        Detail Peminjaman & Denda
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selected ? (
                        <Row>
                            <Col md={6}>
                                <Card className="mb-3">
                                    <Card.Header className="bg-light">
                                        <i className="bi bi-person me-2"></i>
                                        Informasi Member
                                    </Card.Header>
                                    <Card.Body>
                                        <p className="mb-1">
                                            <strong>Nama:</strong> {getMemberName(selected.id_member)}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Alamat:</strong> {getMemberDetail(selected.id_member).alamat || "-"}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Email:</strong> {getMemberDetail(selected.id_member).email || "-"}
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="mb-3">
                                    <Card.Header className="bg-light">
                                        <i className="bi bi-book me-2"></i>
                                        Informasi Buku
                                    </Card.Header>
                                    <Card.Body>
                                        <p className="mb-1">
                                            <strong>Judul:</strong> {getBookTitle(selected.id_buku)}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Pengarang:</strong> {getBookDetail(selected.id_buku).pengarang || "-"}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Penerbit:</strong> {getBookDetail(selected.id_buku).penerbit || "-"}
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12}>
                                <Card>
                                    <Card.Header className="bg-light">
                                        <i className="bi bi-cash me-2"></i>
                                        Riwayat Denda
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <ListGroup variant="flush">
                                            {getDendaList(selected.id_member, selected.id_buku).length > 0 ? (
                                                getDendaList(selected.id_member, selected.id_buku).map((d, i) => (
                                                    <ListGroup.Item key={i} className="py-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <Badge
                                                                    bg={d.jenis_denda === 'terlambat' ? 'warning' :
                                                                        d.jenis_denda === 'kerusakan' ? 'danger' :
                                                                            'secondary'}
                                                                    className="me-2"
                                                                >
                                                                    {d.jenis_denda.toUpperCase()}
                                                                </Badge>
                                                                <span className="text-muted">
                                                                    {d.deskripsi}
                                                                </span>
                                                            </div>
                                                            <h5 className="mb-0">
                                                                <Badge bg="danger" pill>
                                                                    Rp {Number(d.jumlah_denda).toLocaleString('id-ID')}
                                                                </Badge>
                                                            </h5>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))
                                            ) : (
                                                <ListGroup.Item className="text-center py-4">
                                                    <i className="bi bi-emoji-smile h4 d-block"></i>
                                                    Tidak ada denda untuk peminjaman ini
                                                </ListGroup.Item>
                                            )}
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        <div className="text-center py-4">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-2 mb-0">Memuat data...</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setDetailModal(false)}>
                        Tutup
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
