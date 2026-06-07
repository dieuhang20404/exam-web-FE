import { Layout, Menu } from "antd";
import {
  SettingOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined
} from "@ant-design/icons";

import { Outlet, useNavigate } from "react-router-dom";
import "./DashboardLayout.css";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { getRole, logout } from "../store/auth";

const { Sider, Content } = Layout;

function DashboardLayout() {
  const navigate = useNavigate();
  const role = getRole() || "student"; 

  const menuItems = [
    {
      key: "/teacher/dashboard",
      icon: <AppstoreOutlined />,
      label: "Dashboard",
      roles: ["admin", "teacher"]
    },
    {
      key: "/teacher/classManagement",
      icon: <TeamOutlined />,
      label: "Quản lý lớp học",
      roles: ["teacher"]
    },
    {
      key: "question-management",
      icon: <BookOutlined />,
      label: "Ngân hàng câu hỏi",
      roles: ["teacher"],
      children: [
        {
          key: "/teacher/questionBankSubject",
          label: "Ngân hàng câu hỏi",
          roles: ["teacher"] 
        },
        {
          key: "/teacher/examBankSubject",
          label: "Ngân hàng đề thi",
          roles: ["teacher"]
        }
      ]
    },
    {
      key: "/teacher/sessionList",
      icon: <FileTextOutlined />,
      label: "Kỳ thi",
      roles: ["teacher"]
    }
  ];

  const filterMenuByRole = (items) => {
    return items
      .filter((item) => item.roles && item.roles.includes(role))
      .map((item) => {
        if (item.children) {
          return { ...item, children: filterMenuByRole(item.children) };
        }
        return item;
      });
  };

  const filteredMenu = filterMenuByRole(menuItems);
  const handleMenuClick = ({ key }) => {
    if (key === "question-management") return;
    navigate(key);
  };

  const handleBottomMenuClick = ({ key }) => {
    if (key === "/logout") {
      logout(); 
      navigate("/"); 
    } else {
      navigate(key);
    }
  };

  return (
    <Layout className="dashboard-layout">
      <Sider width={260} className="custom-sider">
        {/* logo */}
        <div className="sidebar-logo">
          <h2>Ứng dụng thi trực tuyến</h2>
        </div>

        {/* menu chính */}
        <Menu
          mode="inline"
          className="main-menu"
          onClick={handleMenuClick} // Dùng hàm xử lý mới tách biệt
          items={filteredMenu}
        />

        {/* menu dưới cùng */}
        <div className="sidebar-bottom">
          <Menu
            mode="inline"
            items={[
              {
                key: "/settings",
                icon: <SettingOutlined />,
                label: "Cài đặt"
              },
              {
                key: "/logout",
                icon: <LogoutOutlined />,
                label: "Đăng xuất"
              }
            ]}
            onClick={handleBottomMenuClick} // Dùng hàm xử lý riêng cho Đăng xuất
          />
        </div>
      </Sider>

      <Layout>
        <Header />

        <Content className="dashboard-content">
          <Outlet />
        </Content>

        <Footer />
      </Layout>
    </Layout>
  );
}

export default DashboardLayout;