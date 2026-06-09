
import { login, register } from "../api/api"; 
import { useNavigate  } from 'react-router-dom';
import { setAuth, getRole } from "../store/auth";
import { jwtDecode } from "jwt-decode";
import './Login.css';
import bg from "../assets/bg-login.png";
import React, { useState, useEffect } from "react";
import { Typography, message, Form, Input, Button, Modal, Select } from "antd";

const { Title } = Typography;

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [openForgotModal, setOpenForgotModal] = useState(false);
    const [openRegisterModal, setOpenRegisterModal] = useState(false);
    const onFinish = async (values) => {
    try {
        setLoading(true);
        console.log("--- 1. BẮT ĐẦU SUBMIT FORM LOGIN VỚI DATA: ---", values);
        
        const res = await login(values);
        console.log("--- 2. LOGIN RESPONSE THÀNH CÔNG =", res);
        
        const token = res?.accessToken || res?.data?.accessToken;
        console.log("--- 3. TOKEN TRÍCH XUẤT ĐƯỢC =", token);
        
        if (!token) {
            message.error("Không tìm thấy token trong phản hồi từ Server");
            return;
        }
        localStorage.setItem("token", token);
        // Gọi hàm setAuth của bạn để lưu token + user vào localStorage
        setAuth(token);
        
        // Giải mã token để check role thực tế
        const decodedUser = jwtDecode(token);
        console.log("--- 4. DỮ LIỆU USER SAU KHI DECODE TOKEN =", decodedUser);
        
        // Lấy đúng trường role (Quét hết các trường hợp viết lệch tên)
        const userRole = decodedUser?.role || decodedUser?.roles || decodedUser?.roleName;
        console.log("--- 5. ROLE CUỐI CÙNG DÙNG ĐỂ CHECK:", userRole);

        if (!userRole) {
            message.error("Tài khoản không có quyền (Role) hợp lệ!");
            return;
        }

        // Kiểm tra quyền và điều hướng (Ép về chữ thường để tránh lệch viết hoa viết thường)
        if (['admin', 'teacher'].includes(userRole.toLowerCase())) {
            console.log("=> Điều hướng sang trang TEACHER");
            navigate('/teacher/classManagement');
        } else {
            console.log("=> Điều hướng sang trang STUDENT");
            navigate('/student/dashboard');
        }
        
        message.success("Đăng nhập thành công");

    } catch (err) {
        console.error("--- ❌ LỖI RỒI! HÀM ONFINISH NHẢY VÀO CATCH: ---");
        console.error("Chi tiết object lỗi:", err);
        console.error("Data lỗi từ Back-end trả về (nếu có):", err.response?.data);
        
        const errorMsg = err.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại!";
        message.error(errorMsg);
    } finally {
        setLoading(false);
    }
};

    const handleRegister = async (values) => {
        try {
            const payload = {
                email: values.email,
                fullName: values.fullName,
                password: values.password,
                role: values.role,
            };
            await register(payload);
            message.success("Đăng ký thành công");
            setOpenRegisterModal(false);
        } catch (error) {
            console.error(error);
            message.error("Đăng ký thất bại");
        }
    };

    return (
        <div className='login-container'>
            <div  className="container-left"
                        style={{ backgroundImage: `url(${bg})`}} >
            </div>
            <div className='container-right'>
                <Title className='login-title'>
                    Ứng Dụng Thi Trực Tuyến
                </Title>
                <div className="login-social">
                    <span> Đăng nhập với</span>
                    <Button  className='btn-login'>
                        <img 
                            src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" 
                            alt="Google Logo" 
                            className="google-icon"
                        />
                        Google
                    </Button>
                    <span>Hoặc</span>
                </div>

                <Form onFinish={onFinish}>
                    <Form.Item
                    label="Tài khoản"
                    name="email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                    >
                    <Input placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                    >
                    <Input.Password placeholder="Password" />
                    </Form.Item>
                    <div className='forgot-resign'>
                        <Button 
                            type="link"
                            onClick={() => setOpenForgotModal(true)}
                        >
                            Quên mật khẩu
                        </Button>
                        <Button 
                            type="link"
                            onClick={() => setOpenRegisterModal(true)}
                        >
                            Đăng ký tài khoản
                        </Button>
                    </div>
                    <Button className='btn-login' htmlType = "submit">Login</Button>
                </Form>

            </div>
            <Modal
                title="Quên mật khẩu"
                open={openForgotModal}
                onCancel={() => setOpenForgotModal(false)}
                footer={null}
            >
                <Form
                    layout="vertical"
                    onFinish={(values) => {
                        console.log(values);
                        //
                        message.success(
                            "Đã gửi yêu cầu khôi phục mật khẩu"
                        );
                        setOpenForgotModal(false);
                    }}
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            {
                                required: true,
                                message: "Nhập email"
                            },
                            {
                                type: "email",
                                message: "Email không hợp lệ"
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                    >
                        Gửi yêu cầu
                    </Button>
                </Form>
            </Modal>

            <Modal
                title="Đăng ký tài khoản"
                open={openRegisterModal}
                onCancel={() => setOpenRegisterModal(false)}
                footer={null}
            >
                <Form
                    layout="vertical"
                    onFinish={handleRegister}
                >
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập họ tên",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập email",
                            },
                            {
                                type: "email",
                                message: "Email không hợp lệ",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập mật khẩu",
                            },
                            {
                                min: 6,
                                message: "Mật khẩu tối thiểu 6 ký tự",
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Nhập lại mật khẩu"
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng nhập lại mật khẩu",
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (
                                        !value ||
                                        getFieldValue("password") === value
                                    ) {
                                        return Promise.resolve();
                                    }

                                    return Promise.reject(
                                        new Error(
                                            "Mật khẩu xác nhận không khớp"
                                        )
                                    );
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="Vai trò"
                        name="role"
                        initialValue="student"
                    >
                        <Select>
                            <Select.Option value="student">
                                Student
                            </Select.Option>
                            <Select.Option value="teacher">
                                Teacher
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                    >
                        Đăng ký
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}

export default Login;