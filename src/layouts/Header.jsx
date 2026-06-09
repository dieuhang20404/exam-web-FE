import React from "react";
import "./Header.css";
import {
  SearchOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  UserOutlined
} from "@ant-design/icons";

import { getRole } from "../store/auth"; //getName

import {
  useLocation
} from "react-router-dom";

const Header = () => {
  const role = getRole();
 // const name = getName();

  const location = useLocation();

  const roleLabel = {
    admin: "Admin",
    teacher: "Giảng viên",
    student: "Sinh viên"
  };
  return (
    <header className="custom-header">
      <div className="header-search">
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