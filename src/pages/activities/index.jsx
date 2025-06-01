import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../../constant";
import {
    Modal, Button, Form, Row, Col, Container,
    Card, Badge, ListGroup, Spinner
} from "react-bootstrap";
import * as XLSX from "xlsx";

export default function ActivitiesPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");

    const [form, setForm] = useState({
        id_member: "",
        id_buku: "",
        tgl_pinjam: "",
        tgl_pengembalian: "",
    });

    const [dataPeminjaman, setDataPeminjaman] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [lateFeesData, setLateFeesData] = useState([]);
    const [activeView, setActiveView] = useState("belumDikembalikan");

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const [peminjamanRes, booksRes, membersRes] = await Promise.all([
                axios.get(`${API_URL}/peminjaman`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/buku`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/member`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            setDataPeminjaman(peminjamanRes.data?.data || []);
            setBooks(booksRes.data || []);
            setMembers(membersRes.data || []);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Gagal memuat data", "error");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { id_member, id_buku, tgl_pinjam, tgl_pengembalian } = form;
        if (!id_member || !id_buku || !tgl_pinjam || !tgl_pengembalian) {
            return Swal.fire("Error", "Semua field wajib diisi", "error");
        }

        try {
            await axios.post(`${API_URL}/peminjaman`, form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setForm({ id_member: "", id_buku: "", tgl_pinjam: "", tgl_pengembalian: "" });
            fetchData();
            Swal.fire("Berhasil", "Peminjaman berhasil ditambahkan", "success");
        } catch (error) {
            console.error(error);
            Swal.fire("Gagal", "Tidak dapat menyimpan data peminjaman", "error");
        }
    };

    const handlePengembalian = async (item) => {
        try {
            if (!item || !item.id) {
                return Swal.fire("Error", "Data peminjaman tidak valid", "error");
            }

            const response = await axios.put(
                `${API_URL}/peminjaman/pengembalian/${item.id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 200 || response.status === 201) {
                const today = moment();
                const dueDate = moment(item.tgl_pengembalian);
                const lateDays = today.diff(dueDate, "days");

                if (lateDays > 0) {
                    const totalDenda = lateDays * 1500;

                    Swal.fire({
                        icon: "warning",
                        title: "Pengembalian Terlambat",
                        html: `Anda telat mengembalikan buku selama <b>${lateDays} hari</b>.<br>Dikenakan denda <b>Rp${totalDenda}</b> (Rp1500/hari).`,
                        confirmButtonText: "Bayar Denda & Lihat Detail"
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            const denda = {
                                id_member: item.id_member,
                                id_buku: item.id_buku,
                                jumlah_denda: totalDenda.toString(),
                                jenis_denda: "terlambat",
                                deskripsi: `Terlambat ${lateDays} hari`,
                            };

                            await axios.post(`${API_URL}/denda`, denda, {
                                headers: { Authorization: `Bearer ${token}` },
                            });

                            navigate("/FinesPage");
                        } else {
                            fetchData();
                            setActiveView("sudahDikembalikan");
                        }
                    });
                } else {
                    Swal.fire("Berhasil", "Buku berhasil dikembalikan tepat waktu.", "success").then(() => {
                        fetchData();
                        setActiveView("sudahDikembalikan");
                    });
                }
            } else {
                Swal.fire("Gagal", "Pengembalian gagal", "error");
            }
        } catch (error) {
            console.error("Error saat pengembalian:", error);
            Swal.fire("Error", "Gagal melakukan pengembalian", "error");
        }
    };

    const showDetails = async (item) => {
        try {
            const res = await axios.get(`${API_URL}/denda`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const denda = (res.data?.data || []).filter(
                (d) => d.id_member === item.id_member && d.id_buku === item.id_buku
            );
            setLateFeesData(denda);
            setSelectedDetail(item);
            setShowDetailModal(true);
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Gagal memuat detail denda", "error");
        }
    };

    const handleSwipeLeft = () => {
        if (activeView === "sudahDikembalikan") setActiveView("belumDikembalikan");
    };

    const handleSwipeRight = () => {
        if (activeView === "belumDikembalikan") setActiveView("sudahDikembalikan");
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(dataPeminjaman.map(item => ({
            Member: members.find(m => m.id === item.id_member)?.nama || "Unknown",
            Buku: books.find(b => b.id === item.id_buku)?.judul || "Unknown",
            "Tanggal Pinjam": item.tgl_pinjam,
            "Tanggal Kembali": item.tgl_pengembalian,
            Status: item.status_pengembalian ? "Sudah Dikembalikan" : "Belum Dikembalikan",
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Peminjaman");

        XLSX.writeFile(workbook, "Data_Peminjaman.xlsx");
    };

    // Sort dataPeminjaman by the latest return date or fine date
    const sortedDataPeminjaman = [...dataPeminjaman].sort((a, b) => new Date(b.tgl_pengembalian || b.createdAt) - new Date(a.tgl_pengembalian || a.createdAt));

    return (
        <Container className="mt-4">
            <Card className="shadow-lg border-0 rounded-4 mb-4">
                <Card.Header className="bg-secondary text-light rounded-top-4 text-center">
                    <h2 className="mb-0">Book Lending</h2>
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
                                        <option value="">Pilih Member</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id}>{m.nama}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Pilih member yang akan meminjam buku
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <i className="bi bi-calendar-event me-1"></i>
                                        Tanggal Pinjam
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="tgl_pinjam"
                                        value={form.tgl_pinjam}
                                        onChange={handleChange}
                                        required
                                        className="shadow-sm"
                                    />
                                    <Form.Text className="text-muted">
                                        Tanggal buku akan dipinjam
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
                                        <option value="">Pilih Buku</option>
                                        {books.map((b) => (
                                            <option key={b.id} value={b.id}>{b.judul}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Text className="text-muted">
                                        Pilih buku yang akan dipinjam
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <i className="bi bi-calendar-check me-1"></i>
                                        Tanggal Kembali
                                        <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="tgl_pengembalian"
                                        value={form.tgl_pengembalian}
                                        onChange={handleChange}
                                        required
                                        className="shadow-sm"
                                    />
                                    <Form.Text className="text-muted">
                                        Batas waktu pengembalian buku
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-center">
                            <Button type="submit" variant="secondary">
                                <i className="bi bi-send me-1"></i>
                                Ajukan Peminjaman
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
            <Card className="shadow-lg border-0 rounded-4 mb-4">
                <Card.Header className="bg-white">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <Button
                                variant={activeView === "belumDikembalikan" ? "secondary" : "light"}
                                className={`nav-link text-black ${activeView === "belumDikembalikan" ? "active" : ""}`}
                                onClick={() => setActiveView("belumDikembalikan")}
                            >
                                <i className="bi bi-clock-history me-1"></i>
                                Belum Dikembalikan
                            </Button>
                        </li>
                        <li className="nav-item">
                            <Button
                                variant={activeView === "sudahDikembalikan" ? "secondary" : "light"}
                                className={`nav-link text-black ${activeView === "sudahDikembalikan" ? "active" : ""}`}
                                onClick={() => setActiveView("sudahDikembalikan")}
                            >
                                <i className="bi bi-check-circle me-1"></i>
                                Sudah Dikembalikan
                            </Button>
                        </li>
                    </ul>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0 align-middle text-center">
                            <thead className="bg-light">
                                <tr>
                                    <th className="text-center">Member</th>
                                    <th className="text-center">Buku</th>
                                    <th className="text-center">Tanggal Pinjam</th>
                                    <th className="text-center">Tanggal Kembali</th>
                                    <th className="text-center">Status</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedDataPeminjaman
                                    .filter((item) => activeView === "belumDikembalikan" ? !item.status_pengembalian : item.status_pengembalian)
                                    .length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            <i className="bi bi-inbox h3 d-block"></i>
                                            Tidak ada data peminjaman
                                            {activeView === "belumDikembalikan" ? " yang belum dikembalikan" : ""}
                                        </td>
                                    </tr>
                                ) : (
                                    sortedDataPeminjaman
                                        .filter((item) => activeView === "belumDikembalikan" ? !item.status_pengembalian : item.status_pengembalian)
                                        .map((item) => {
                                            const member = members.find((m) => m.id === item.id_member)?.nama || "Unknown";
                                            const book = books.find((b) => b.id === item.id_buku)?.judul || "Unknown";
                                            const isLate = moment().isAfter(moment(item.tgl_pengembalian)) && !item.status_pengembalian;

                                            return (
                                                <tr key={item.id}>
                                                    <td className="align-middle text-center" style={{ maxWidth: 160, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                                                        <div className="fw-bold">{member}</div>
                                                        <small className="text-muted">ID: {item.id_member}</small>
                                                    </td>
                                                    <td className="align-middle text-center" style={{ maxWidth: 160, whiteSpace: "pre-line", wordBreak: "break-word" }}>
                                                        <div>{book}</div>
                                                        <small className="text-muted">
                                                            {books.find((b) => b.id === item.id_buku)?.pengarang}
                                                        </small>
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        <div>{moment(item.tgl_pinjam).format("DD MMM YYYY")}</div>
                                                        <small className="text-muted">
                                                            {moment(item.tgl_pinjam).fromNow()}
                                                        </small>
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        <div>{moment(item.tgl_pengembalian).format("DD MMM YYYY")}</div>
                                                        <small className="text-muted">
                                                            {moment(item.tgl_pengembalian).fromNow()}
                                                        </small>
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {item.status_pengembalian ? (
                                                            <Badge bg="success" pill>Sudah Dikembalikan</Badge>
                                                        ) : isLate ? (
                                                            <Badge bg="danger" pill>Terlambat</Badge>
                                                        ) : (
                                                            <Badge bg="primary" pill>Sedang Dipinjam</Badge>
                                                        )}
                                                    </td>
                                                    <td className="align-middle text-center">
                                                        {!item.status_pengembalian && (
                                                            <Button
                                                                variant="outline-success"
                                                                size="sm"
                                                                className="me-2"
                                                                onClick={() => handlePengembalian(item)}
                                                            >
                                                                <i className="bi bi-check2 me-1"></i>
                                                                Kembalikan
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => showDetails(item)}
                                                        >
                                                            <i className="bi bi-eye me-1"></i>
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

            {/* Modal Detail */}
            <Modal
                show={showDetailModal}
                onHide={() => setShowDetailModal(false)}
                size="lg"
                centered
                scrollable
            >
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>
                        <i className="bi bi-info-circle me-2"></i>
                        Detail Peminjaman
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDetail ? (
                        <Row>
                            <Col md={6}>
                                <Card className="mb-3">
                                    <Card.Header className="bg-light">
                                        <i className="bi bi-person me-2"></i>
                                        Informasi Member
                                    </Card.Header>
                                    <Card.Body>
                                        <p className="mb-1">
                                            <strong>Nama:</strong>{' '}
                                            {members.find((m) => m.id === selectedDetail.id_member)?.nama || "-"}
                                        </p>
                                        <p className="mb-1">
                                            <strong>ID Member:</strong> {selectedDetail.id_member}
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
                                            <strong>Judul:</strong>{' '}
                                            {books.find((b) => b.id === selectedDetail.id_buku)?.judul || "-"}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Pengarang:</strong>{' '}
                                            {books.find((b) => b.id === selectedDetail.id_buku)?.pengarang || "-"}
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col xs={12}>
                                <Card>
                                    <Card.Header className="bg-light">
                                        <i className="bi bi-cash me-2"></i>
                                        Informasi Denda
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        <ListGroup variant="flush">
                                            {lateFeesData.length === 0 ? (
                                                <ListGroup.Item className="text-center py-4">
                                                    <i className="bi bi-emoji-smile h4 d-block"></i>
                                                    Tidak ada denda untuk peminjaman ini
                                                </ListGroup.Item>
                                            ) : (
                                                lateFeesData.map((denda, idx) => (
                                                    <ListGroup.Item key={idx}>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <Badge
                                                                    bg={denda.jenis_denda === 'terlambat' ? 'warning' : 'danger'}
                                                                    className="me-2"
                                                                >
                                                                    {denda.jenis_denda.toUpperCase()}
                                                                </Badge>
                                                                <span className="text-muted">{denda.deskripsi}</span>
                                                            </div>
                                                            <h6 className="mb-0">
                                                                <Badge bg="danger" pill>
                                                                    Rp {Number(denda.jumlah_denda).toLocaleString('id-ID')}
                                                                </Badge>
                                                            </h6>
                                                        </div>
                                                    </ListGroup.Item>
                                                ))
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
                    <Button variant="link" as={Link} to="/FinesPage">
                        <i className="bi bi-arrow-right me-1"></i>
                        Lihat Semua Denda
                    </Button>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Tutup
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
