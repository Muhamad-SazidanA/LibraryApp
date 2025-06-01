import React from "react";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function Template() {
    return (
        <div className="min-vh-100 bg-light">
            <Navbar />
            <main className="pt-5 mt-4">
                <Container fluid className="px-4 py-3">
                    <Outlet />
                </Container>
            </main>
        </div>
    );
}