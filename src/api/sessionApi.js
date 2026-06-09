
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
// Tạo phiên kiểm tra
export const createSession = (data) =>
  api.post("/sessions", data);

// Cập nhật phiên kiểm tra
export const updateSession = (sessionId, data) =>
  api.patch(`/sessions/${sessionId}`, data);

// Lấy danh sách phiên kiểm tra
export const getSessions = (params) =>
  api.get("/sessions", {
    params
  });

// Lấy chi tiết phiên kiểm tra
export const getSessionById = (sessionId) =>
  api.get(`/sessions/${sessionId}`);

// Xóa phiên kiểm tra
export const deleteSession = (sessionId) =>
  api.delete(`/sessions/${sessionId}`);