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

export const getRetakes = (query) =>
  api.get("/retakes",{ params: query });

export const getRetakeById = (id) =>
  api.get(`/retakes/${id}`);

export const createRetake = (data) =>
  api.post("/retakes", data);

export const rejectRetake = (id) =>
  api.patch(`/retakes/${id}/reject`);

export const grantRetakePermission = (id, data) =>
  api.post(`/retakes/${id}/grant`, data);

export const getPermissions = (query) =>
  api.get(`/retakes/permissions`, { params: query });

export const getPermissionById = (id) =>
  api.get(`/retakes/permissions/${id}`);