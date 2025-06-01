import { createBrowserRouter, Navigate } from "react-router-dom";
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
        element: <Login />,
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Template />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "",
                element: <Dashboard />,
            },
            {
                path: "dashboard",
                element: <Dashboard />,
            },
            {
                path: "members",
                element: <MemberPage />,
            },
            {
                path: "mybooks",
                element: <BookPage />,
            },
            {
                path: "BorrowPage",
                element: <BorrowPage />,
            },
            {
                path: "DataPinjam",
                element: <DataPinjam />,
            },
            {
                path: "FinesPage",
                element: <FinesPage />,
            },
            {
                path: "*",
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);