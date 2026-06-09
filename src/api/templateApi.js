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

// Tạo mẫu đề
export const createTemplate = (data) =>
  api.post("/templates", data);

// Cập nhật mẫu đề
export const updateTemplate = (templateId, data) =>
  api.patch(`/templates/${templateId}`, data);

// Lấy danh sách mẫu đề
export const getTemplates = (params) =>
  api.get("/templates", {params});

// Lấy chi tiết mẫu đề
export const getTemplateById = (templateId) =>
  api.get(`/templates/${templateId}`);

// Xóa mẫu đề
export const deleteTemplate = (templateId) =>
  api.delete(`/templates/${templateId}`);

// Lấy câu hỏi trong mẫu đề
export const getTemplateQuestions = (templateId) =>
  api.get(`/templates/${templateId}/questions`);