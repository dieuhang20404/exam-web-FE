
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", 
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Lấy danh sách sự kiện
export const getProctorings = (params) =>
  api.get("/proctorings", { params });

// Chi tiết sự kiện
export const getProctoringById = (id) =>
  api.get(`/proctorings/${id}`);