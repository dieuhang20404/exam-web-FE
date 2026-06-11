
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
// Bắt đầu làm bài
export const createAttempt = (data) =>
  api.post("/attempts", data);

// Lưu đáp án tạm thời
export const updateAttempt = (attemptId, data) =>
  api.patch(`/attempts/${attemptId}`, data);

// Nộp bài
export const submitAttempt = (attemptId) =>
  api.patch(`/attempts/${attemptId}/submit`);

// Danh sách bài làm
export const getAttempts = (params) =>
  api.get("/attempts", { params });

// Bài làm hiện tại
export const getCurrentAttempt = () =>
  api.get("/attempts/current");