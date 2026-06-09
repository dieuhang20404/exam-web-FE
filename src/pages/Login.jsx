// src/pages/Login.jsx

import { login, register } from "../api/api"; 
import { useNavigate } from 'react-router-dom';
import { setAuth } from "../store/auth";
import { jwtDecode } from "jwt-decode";
import './Login.css';
import bg from "../assets/bg-login.png";
import React, { useState } from "react";
import { Typography, message, Form, Input, Button, Modal, Select } from "antd";

const { Title } = Typography;

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [openForgotModal, setOpenForgotModal] = useState(false);
    const [openRegisterModal, setOpenRegisterModal] = useState(false);

    // ================= XỬ LÝ ĐĂNG NHẬP =================
    const onFinish = async (values) => {
        try {
            setLoading(true);
            console.log("--- 1. BẮT ĐẦU SUBMIT FORM LOGIN VỚI DATA: ---", values);
            
            const res = await login(values);
            console.log("--- 2. LOGIN RESPONSE THÀNH CÔNG =", res);
            
            const token = res?.accessToken || res?.data?.accessToken || res?.token || res?.data?.token;
            console.log("--- 3. TOKEN TRÍCH XUẤT ĐƯỢC =", token);
            
            if (!token) {
                message.error("Không tìm thấy token trong phản hồi từ Server");
                return;
            }

            // Đồng bộ lưu trữ Token vào LocalStorage
            localStorage.setItem("token", token);
            
            // Gọi hàm setAuth của bạn để cập nhật trạng thái Context/Redux
            if (typeof setAuth === "function") {
                setAuth(token);
            }
            
            // Giải mã token để check quyền hạn thực tế
            const decodedUser = jwtDecode(token);
            console.log("--- 4. DỮ LIỆU USER SAU KHI DECODE TOKEN =", decodedUser);
            
            // Quét linh hoạt các trường hợp định dạng thuộc tính Role của Backend
            const userRole = decodedUser?.role || decodedUser?.roles || decodedUser?.roleName || decodedUser?.type;
            console.log("--- 5. ROLE CUỐI CÙNG DÙNG ĐỂ CHECK:", userRole);

            if (!userRole) {
                message.error("Tài khoản không có quyền (Role) hợp lệ!");
                return;
            }

            message.success("Đăng nhập thành công");

            // Ép chuỗi về dạng chữ thường để tránh lỗi so khớp ký tự hoa/thường
            const normalizedRole = String(userRole).toLowerCase();
            if (['admin', 'teacher', 'instructor'].includes(normalizedRole)) {
                console.log("=> Điều hướng sang trang TEACHER");
                navigate('/teacher/classManagement');
            } else {
                console.log("=> Điều hướng sang trang STUDENT");
                navigate('/student/dashboard');
            }
            
        } catch (err) {
            console.error("--- ❌ LỖI RỒI! HÀM ONFINISH NHẢY VÀO CATCH: ---");
            console.error("Chi tiết object lỗi:", err);
            console.error("Data lỗi từ Back-end trả về (nếu có):", err.response?.data);
            
            const errorMsg = err.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại!";
            message.error(Array.isArray(errorMsg) ? errorMsg.join(" | ") : errorMsg);
        } finally {
            setLoading(false);
        }
    };
    // ================= XỬ LÝ ĐĂNG KÝ =================
    const handleRegister = async (values) => {
        try {
            setLoading(true);
            const payload = {
                email: values.email,
                fullName: values.fullName,
                password: values.password,
                role: values.role,
            };
            await register(payload);
            message.success("Đăng ký tài khoản thành công!");
            setOpenRegisterModal(false);
        } catch (error) {
            console.error(error);
            const regError = error.response?.data?.message || "Đăng ký thất bại";
            message.error(Array.isArray(regError) ? regError.join(" | ") : regError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-container'>
            <div className="container-left" style={{ backgroundImage: `url(${bg})` }}></div>
            
            <div className='container-right'>
                <Title className='login-title'>Ứng Dụng Thi Trực Tuyến</Title>
                
                <div className="login-social">
                    <span> Đăng nhập với</span>
                    <Button className='btn-login' disabled={loading}>
                        <img 
                            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" 
                            alt="Google Logo" 
                            className="google-icon"
                        />
                        Google
                    </Button>
                    <span>Hoặc</span>
                </div>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Tài khoản"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Định dạng email không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Email" disabled={loading} size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password placeholder="Password" disabled={loading} size="large" />
                    </Form.Item>

                    <div className='forgot-resign'>
                        <Button type="link" onClick={() => setOpenForgotModal(true)} disabled={loading}>
                            Quên mật khẩu
                        </Button>
                        <Button type="link" onClick={() => setOpenRegisterModal(true)} disabled={loading}>
                            Đăng ký tài khoản
                        </Button>
                    </div>

                    <Button 
                        className='btn-login' 
                        htmlType="submit" 
                        type="primary" 
                        loading={loading}
                        block
                        size="large"
                        style={{ background: loading ? '#ccc' : '#efc45d', color: '#000', border: 'none', fontWeight: 'bold' }}
                    >
                        {loading ? "Đang xác thực..." : "Đăng nhập"}
                    </Button>
                </Form>
            </div>

            {/* MODAL QUÊN MẬT KHẨU */}
            <Modal
                title="Quên mật khẩu"
                open={openForgotModal}
                onCancel={() => setOpenForgotModal(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    layout="vertical"
                    onFinish={(values) => {
                        console.log(values);
                        message.success("Đã gửi yêu cầu khôi phục mật khẩu qua Email!");
                        setOpenForgotModal(false);
                    }}
                >
                    <Form.Item
                        name="email"
                        label="Email khôi phục"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" }
                        ]}
                    >
                        <Input size="large" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large">
                        Gửi yêu cầu
                    </Button>
                </Form>
            </Modal>

            {/* MODAL ĐĂNG KÝ */}
            <Modal
                title="Đăng ký tài khoản"
                open={openRegisterModal}
                onCancel={() => setOpenRegisterModal(false)}
                footer={null}
                destroyOnClose
            >
                <Form layout="vertical" onFinish={handleRegister}>
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                    >
                        <Input size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" }
                        ]}
                    >
                        <Input size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu!" },
                            { min: 6, message: "Mật khẩu tối thiểu phải từ 6 ký tự trở lên!" }
                        ]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Nhập lại mật khẩu"
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận lại mật khẩu!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu xác nhận không trùng khớp!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item label="Vai trò" name="role" initialValue="student">
                        <Select size="large">
                            <Select.Option value="student">Student (Sinh viên)</Select.Option>
                            <Select.Option value="teacher">Teacher (Giáo viên)</Select.Option>
                        </Select>
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block loading={loading} size="large">
                        Đăng ký ngay
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}

export default Login;