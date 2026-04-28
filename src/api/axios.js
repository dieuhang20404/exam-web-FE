import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) =>{
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = (data) => {
    return api.post('/auth/login', data); // Thay đường dẫn '/auth/login' cho đúng với BE của bạn
};

export default api;