
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
// GET /subjects
export const getSubjects = (params) => {
  return api.get("/subjects", { params });
};

// GET /subjects/:id
export const getSubjectById = (id) => {
  return api.get(`/subjects/${id}`);
};

// POST /subjects
export const createSubject = (body) => {
  return api.post("/subjects", body);
};

// PATCH /subjects/:id
export const updateSubject = (id, body) => {
  return api.patch(`/subjects/${id}`, body);
};