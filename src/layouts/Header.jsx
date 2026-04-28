import React from "react";
import './Header.css';
import { getRole, getName } from '../store/auth';

const Header = () => {

    const role = getRole();
    const name = getName();

    const roleLabel = {
        admin: "Admin",
        teacher: "Giảng viên",
        student: "Sinh viên"
    };

    return (
        <div className="header">
            <div className="logo">ỨNG DỤNG THI TRỰC TUYẾN</div>

            <div className="user-info">
                <span>
                    Chào, {roleLabel[role]} {name}
                </span>
                <button className="btn-logout">Đăng xuất</button>
            </div>
        </div>
    );
};

export default Header;