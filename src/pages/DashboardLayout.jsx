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
import { getRole } from "../store/auth";

const { Sider, Content } = Layout;

function DashboardLayout() {
  const navigate = useNavigate();
  const role = getRole();

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
          label: "Ngân hàng câu hỏi"
        },
        {
          key: "/teacher/examBankSubject",
          label: "Ngân hàng đề thi"
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

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(role)
  );

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
          onClick={({ key }) => navigate(key)}
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
            onClick={({ key }) => navigate(key)}
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