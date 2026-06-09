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
// Tạo câu hỏi
export const createQuestion = (data) =>
  api.post("/questions", data);

// Tạo nhiều câu hỏi
export const createManyQuestions = (data) =>
  api.post("/questions/bulk", data);

// Cập nhật câu hỏi
export const updateQuestion = (questionId, data) =>
  api.patch(`/questions/${questionId}`, data);

// Xóa câu hỏi
export const deleteQuestion = (questionId) =>
  api.delete(`/questions/${questionId}`);

// Lấy danh sách câu hỏi
export const getQuestions = (data) =>
  api.get("/questions", data);

// Lấy chi tiết câu hỏi
export const getQuestionById = (questionId) =>
  api.get(`/questions/${questionId}`);