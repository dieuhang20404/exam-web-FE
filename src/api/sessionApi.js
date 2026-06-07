
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", 
  timeout: 5000,
});
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