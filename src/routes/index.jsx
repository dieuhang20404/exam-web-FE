// src/routes/index.jsx

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/Login.jsx";

import DashboardLayout from "../pages/DashboardLayout.jsx";

import Dashboard_tea from "../pages/teacher/Dashboard.jsx";

import Dashboard_stu from "../pages/student/Dashboard.jsx";

import HistoryPage from "../pages/student/HistoryPage.jsx";

import ReviewPage from "../pages/student/ReviewPage.jsx";

import ExamIntroPage from "../pages/student/ExamIntroPage.jsx";
import DoingExamPage from "../pages/student/DoingExamPage.jsx";

export default function AppRoutes() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/"
          element={<Login />}
        />

        {/* ================= TEACHER ================= */}

        <Route
          path="/teacher"
          element={<DashboardLayout />}
        >

          <Route
            index
            element={
              <Navigate to="dashboard" />
            }
          />

          <Route
            path="dashboard"
            element={<Dashboard_tea />}
          />

        </Route>

        {/* ================= STUDENT ================= */}

        <Route
          path="/student"
          element={
            <Navigate
              to="/student/dashboard"
            />
          }
        />

        {/* DASHBOARD */}

        <Route
          path="/student/dashboard"
          element={<Dashboard_stu />}
        />

        {/* HISTORY */}

        <Route
          path="/student/history"
          element={<HistoryPage />}
        />

        {/* REVIEW ANSWER */}

        <Route
          path="/student/review/:id"
          element={<ReviewPage />}
        />

        <Route
            path="/student/exam/:id"
            element={<ExamIntroPage />}
        />

        <Route
            path="/student/exam/:id/doing"
            element={<DoingExamPage />}
        />

      </Routes>

    </BrowserRouter>

  );
}