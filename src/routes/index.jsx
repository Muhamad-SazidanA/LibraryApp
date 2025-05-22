// src/router/index.jsx (atau sesuai struktur kamu)
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import Template from "../layout/Template";
import BookPage from "../pages/books/index";
import MemberPage from "../pages/members/index";
import Dashboard from "../pages/Dashboard";
import BorrowPage from "../pages/activities/index.jsx";
import DataPinjam from "../pages/activities/DataPinjam.jsx";
import FinesPage from "../pages/fines/index.jsx";
import ProtectedRoute from "../middleware/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />, // tidak dibungkus Template karena login sebelum akses layout utama
    },
    {
        path: "/",
        element: <Template />,
        children: [
            {
                path: "/",
                element: <App />,
            },
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/members",
                element: (
                    <ProtectedRoute>
                        <MemberPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/mybooks",
                element: (
                    <ProtectedRoute>
                        <BookPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/BorrowPage",
                element: (
                    <ProtectedRoute>
                        <BorrowPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/DataPinjam",
                element: (
                    <ProtectedRoute>
                        <DataPinjam />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/FinesPage",
                element: (
                    <ProtectedRoute>
                        <FinesPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);
