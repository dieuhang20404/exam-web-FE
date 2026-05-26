// src/components/student/Sidebar.jsx

import {
  Home,
  History,
} from "lucide-react";
import logo from "../../assets/logo.png";

import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {

  const navigate = useNavigate();

  const location = useLocation();

  return (

    <div className="sidebar">

      {/* LOGO */}

      <div className="logo">

        <img
          src={logo}
          alt="logo"
        />

      </div>

      {/* MENU */}

      <div className="menu">

        {/* HOME */}

        <div
          className={
            location.pathname === "/student/dashboard"
              ? "menu-item active"
              : "menu-item"
          }
          onClick={() =>
            navigate("/student/dashboard")
          }
        >

          <Home size={24} />

          <span>Trang chủ</span>

        </div>

        {/* HISTORY */}

        <div
          className={
            location.pathname === "/student/history"
              ? "menu-item active"
              : "menu-item"
          }
          onClick={() =>
            navigate("/student/history")
          }
        >

          <History size={24} />

          <span>Lịch sử làm bài</span>

        </div>

      </div>

    </div>

  );
}