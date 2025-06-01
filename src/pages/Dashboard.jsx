import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import { API_URL } from "../constant";
import { Card, Row, Col } from "react-bootstrap";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
    const [chartDataPinjam, setChartDataPinjam] = useState(null);
    const [chartDataMember, setChartDataMember] = useState(null);
    const [chartDataBook, setChartDataBook] = useState(null);
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        async function fetchData() {
            const [pinjamRes, memberRes, bookRes] = await Promise.all([
                axios.get(`${API_URL}/peminjaman`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/member`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/buku`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            const pinjamData = pinjamRes.data?.data || [];
            const perMonthPinjam = {};
            pinjamData.forEach((item) => {
                if (!item.tgl_pinjam) return;
                const date = new Date(item.tgl_pinjam);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                perMonthPinjam[key] = (perMonthPinjam[key] || 0) + 1;
            });
       
            const memberData = Array.isArray(memberRes.data) ? memberRes.data : (memberRes.data?.data || []);
            const perMonthMember = {};
            memberData.forEach((item) => {
                const dateStr = item.createdAt || item.tgl_lahir;
                if (!dateStr) return;
                const date = new Date(dateStr);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                perMonthMember[key] = (perMonthMember[key] || 0) + 1;
            });
     
            const bookData = Array.isArray(bookRes.data) ? bookRes.data : (bookRes.data?.data || []);
            const perMonthBook = {};
            bookData.forEach((item) => {
                const dateStr = item.createdAt || (item.tahun_terbit ? `${item.tahun_terbit}-01-01` : null);
                if (!dateStr) return;
                const date = new Date(dateStr);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                perMonthBook[key] = (perMonthBook[key] || 0) + 1;
            });

            const allKeys = Array.from(
                new Set([
                    ...Object.keys(perMonthPinjam),
                    ...Object.keys(perMonthMember),
                    ...Object.keys(perMonthBook),
                ])
            ).sort();

            const labels = allKeys.map(key => {
                const [year, month] = key.split("-");
                return new Date(`${year}-${month}-01`).toLocaleString("id-ID", { month: "short", year: "numeric" });
            });

            setChartDataPinjam({
                labels,
                datasets: [
                    {
                        label: "Jumlah Peminjaman",
                        data: allKeys.map(key => perMonthPinjam[key] || 0),
                        backgroundColor: "#2563eb",
                    },
                ],
            });
            setChartDataMember({
                labels,
                datasets: [
                    {
                        label: "Member Baru",
                        data: allKeys.map(key => perMonthMember[key] || 0),
                        backgroundColor: "#10b981",
                    },
                ],
            });
            setChartDataBook({
                labels,
                datasets: [
                    {
                        label: "Buku Baru",
                        data: allKeys.map(key => perMonthBook[key] || 0),
                        backgroundColor: "#f59e42",
                    },
                ],
            });
        }
        if (token) fetchData();
    }, [token]);

    return (
        <div>
            <h2 className="fw-bold mb-1 text-light-gradient-2 text-center">Dashboard Overview</h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <p className="text-muted mb-0">Welcome to LibraryHub Management System</p>
                </div>
                <div>
                    <span className="badge bg-secondary text-light fs-6">
                        <i className="bi bi-calendar3 me-2"></i>
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>
            <Row>
                <Col md={6}>
                    <Card className="mb-4 shadow-lg border-0 rounded-4">
                        <Card.Body>
                            <h5 className="mb-3 text-primary">Grafik Peminjaman per Bulan</h5>
                            {chartDataPinjam ? (
                                <Bar data={chartDataPinjam} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                            ) : (
                                <div>Loading chart...</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 shadow-lg border-0 rounded-4">
                        <Card.Body>
                            <h5 className="mb-3 text-success">Grafik Member Baru per Bulan</h5>
                            {chartDataMember ? (
                                <Bar data={chartDataMember} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                            ) : (
                                <div>Loading chart...</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="mb-4 shadow-lg border-0 rounded-4">
                        <Card.Body>
                            <h5 className="mb-3 text-warning">Grafik Buku Baru per Bulan</h5>
                            {chartDataBook ? (
                                <Bar data={chartDataBook} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                            ) : (
                                <div>Loading chart...</div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}