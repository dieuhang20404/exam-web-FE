import { Layout, Menu } from "antd";
import { Outlet, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import Header from "../layouts/header";
import Footer from "../layouts/Footer";
import { getRole } from '../store/auth';

const {Sider, Content } = Layout;




function Dashboard(){
    const navigate = useNavigate();
    const role = getRole();

    const menuItems = [
        {
            key: '/dashboard',
            label: 'Dashboard',
            roles: ['admin', 'teacher']
        },
        {
            key: '/class',
            label: 'Quản lý lớp học',
            roles: ['teacher']
        },
        {
            key: '/question_exam',
            label: 'Quản lý câu hỏi và đề thi',
            roles: ['teacher']
        },
        {
            key: '/session',
            label: 'Quản lý kỳ thi',
            roles: ['teacher']
        },
        {
            key: '/exam-room',
            label: 'Làm bài thi',
            roles: ['student']
        },
        {
            key: '/exam-repeat',
            label: 'Yêu cầu thi lại',
            roles: ['student']
        }
    ];

    const filteredMenu = menuItems
    .filter(item => item.roles.includes(role))
    .map(({ key, label }) => ({ key, label }));
            

    return (
        <div className="dashboard-layout">
            <div className="header">
                <Header />
            </div>
            <div className="content">
                <Layout style={{ minHeight: '100vh'}}>
                    <Sider width={240}>
                        <Menu
                            theme="dark"
                            mode="inline"
                            onClick={({ key }) => navigate(key)}
                            items={filteredMenu}
                            />
                    </Sider>

                    <Layout>
                            <Content style = {{ padding: 20 }}>
                                <Outlet />
                            </Content>
                    </Layout>
                </Layout>
            </div>
            <div className="footer">
                <Footer />
            </div>
        </div>
    );
};

export default Dashboard;