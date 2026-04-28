import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from '../pages/Login.jsx';
import DashboardLayout from '../pages/DashboardLayout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Dashboard_tea from "../pages/teacher/Dashboard.jsx";
import Dashboard_stu from "../pages/student/Dashboard.jsx"

export default function AppRoutes(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />

                <Route
                    path="/teacher"
                    element={
                        <ProtectedRoute allowedRoles={['teacher']}>
                        <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<div>Dashboard Page</div>} />
                    <Route path="dashboard"  element={<Dashboard_tea />} />
                </Route>

                <Route
                    path="/student"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                        <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    
                    <Route path="dashboard" element={<div>Dashboard Page</div>} />
                </Route>
                
            </Routes>
        </BrowserRouter>
    );
}