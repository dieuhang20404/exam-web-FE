import React from "react";
import "./Header.css";
import {
  SearchOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  UserOutlined
} from "@ant-design/icons";

import {
  getRole,
  getName
} from "../store/auth";

import {
  useLocation
} from "react-router-dom";

const Header = () => {
  const role = getRole();
  const name = getName();

  const location = useLocation();

  const roleLabel = {
    admin: "Admin",
    teacher: "Giảng viên",
    student: "Sinh viên"
  };

  // placeholder theo từng trang
  const getSearchPlaceholder =
    () => {
      const path =
        location.pathname;

      if (
        path.includes(
          "classManagement"
        )
      ) {
        return "Tìm kiếm lớp học...";
      }

      if (
        path.includes(
          "session"
        )
      ) {
        return "Tìm kiếm kỳ thi...";
      }

      if (
        path.includes(
          "questionBank"
        )
      ) {
        return "Tìm kiếm câu hỏi...";
      }

      if (
        path.includes(
          "examBank"
        )
      ) {
        return "Tìm kiếm đề thi...";
      }

      return "Tìm kiếm...";
    };

  return (
    <header className="custom-header">
      {/* SEARCH */}
      <div className="header-search">
        <SearchOutlined className="search-icon" />

        <input
          type="text"
          placeholder={getSearchPlaceholder()}
        />
      </div>

      {/* RIGHT */}
      <div className="header-right">
        <BellOutlined className="header-icon" />

        <QuestionCircleOutlined className="header-icon" />

        <div className="header-divider"></div>

        <div className="header-user">
          <div className="avatar">
            <UserOutlined />
          </div>

          <span>
            {
              roleLabel[
                role
              ]
            }{" "}
            {name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;