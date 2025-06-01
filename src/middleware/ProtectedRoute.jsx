import React from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();
    const location = useLocation();
    const [hasAttemptedAccess, setHasAttemptedAccess] = React.useState(false);

    React.useEffect(() => {
        // Hanya tampilkan alert jika:
        // 1. User mencoba mengakses halaman terproteksi
        // 2. Tidak ada token
        // 3. Bukan di halaman login
        // 4. Bukan first load
        if (!token && 
            location.pathname !== "/login" && 
            hasAttemptedAccess && 
            location.pathname !== "/") {
            Swal.fire({
                icon: "error",
                title: "Akses Ditolak",
                text: "Silakan login terlebih dahulu!",
                confirmButtonColor: "#3085d6",
                customClass: {
                    popup: 'animated fadeInDown faster'
                },
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            }).then(() => {
                navigate("/login");
            });
        }
        setHasAttemptedAccess(true);
    }, [token, navigate, location, hasAttemptedAccess]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}