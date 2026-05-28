import {Form, Input, Button } from 'antd';
import { login } from '../api/auth';
import { setAuth  } from '../store/auth';
import { useNavigate  } from 'react-router-dom';
import './Login.css';
import { Typography } from 'antd';
import bg from "../assets/bg-login.png";
import React, { useState, useEffect } from "react";

const { Title } = Typography;

function Login() {
    const navigate = useNavigate();


    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
    try {
        setLoading(true);

        const res = await login(values);

        const token = res.data.accessToken;
        const role = res.data.user.role;
        let  name = res.data.user.name;

        setAuth(token, role, name);

        if (['admin', 'teacher'].includes(role)) {
        navigate('/teacher/dashboard');
        } else {
        navigate('/student/dashboard');
        }

    } catch (err) {
        console.error(err);
        message.error("Đăng nhập thất bại");
    } finally {
        setLoading(false);
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
                        <Button type="link">Quên mật khẩu</Button>
                        <Button type="link">Đăng ký tài khoản</Button>
                    </div>
                    <Button className='btn-login' htmlType = "submit">Login</Button>
                </Form>

            </div>
        </div>
    );
}

export default Login;