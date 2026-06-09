// src/api/api.js

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", 
  timeout: 5000,
});

// ================= REQUEST INTERCEPTOR =================
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

// ================= RESPONSE INTERCEPTOR =================
api.interceptors.response.use(
  (response) => {
    // Trả ra dữ liệu lõi thu được từ Server
    return response.data;
  },
  (error) => {
    console.error("API Error Logged:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log("Phát hiện lỗi 401 nhưng đã chặn không cho đá ra ngoài!");
    }
    return Promise.reject(error);
  }
);

// ================= API FUNCTIONS =================

// ================= SESSIONS =================
export const getSessions = (params = {}) => api.get("/sessions", { params });
export const getSessionById = (id) => api.get(`/sessions/${id}`);

// ================= ATTEMPTS =================
// ================= ATTEMPTS =================
export const createAttempt = (data) => api.post("/attempts", data);

// 1. Lưu đáp án liên tục (Realtime): Truyền thẳng object { newAnswerIds, deleteAnswerIds }
export const updateAttemptAnswers = (attemptId, data) => api.patch(`/attempts/${attemptId}`, data);
export const updateAttempt = (attemptId, data) => api.patch(`/attempts/${attemptId}`, data);

export const submitAttempt = async (attemptId, data) => {
  try {
    // Đổi lại thành api.patch để khớp với PATCH /attempts/:id/submit
    return await api.patch(`/attempts/${attemptId}/submit`, data);
  } catch (error) {
    throw error;
  }
};

export const getAttempts = (params = {}) => api.get("/attempts", { params });
export const getCurrentAttempt = () => api.get("/attempts/current");
export const getAttemptById = (id) => api.get(`/attempts/${id}`);

// ================= QUESTIONS =================
export const getQuestions = (params = {}) => api.get("/questions", { params });
export const getQuestionById = (id) => api.get(`/questions/${id}`);

// ================= TEMPLATES =================
export const getTemplates = (params = {}) => api.get("/templates", { params });
export const getTemplateById = (id) => api.get(`/templates/${id}`);
export const getTemplateQuestions = (id) => api.get(`/templates/${id}/questions`);

// ================= NOTIFICATIONS =================
export const getNotifications = (params = {}) => api.get("/notifications", { params });
export const getNotificationById = (id) => api.get(`/notifications/${id}`);
export const updateNotification = (id, data) => api.patch(`/notifications/${id}`, data);

// ================= SUBJECTS =================
export const getSubjectById = (id) => api.get(`/subjects/${id}`);
export const createSubject = (data) => api.post("/subjects", data);
export const getSubjects = (data) => api.get("/subjects", { params: data });

// ================= USERS =================
export const getUsers = (params = {}) => api.get("/users", { params });
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const getMyProfile = () => api.get("/users/me");
export const updateMyProfile = (data) => api.patch("/users/me", data);
export const changePassword = (data) => api.patch("/users/password", data);

// ================= RETAKES =================
export const getRetakes = (params = {}) => api.get("/retakes", { params });
export const getRetakeById = (id) => api.get(`/retakes/${id}`);
export const createRetake = (data) => api.post("/retakes", data);
export const rejectRetake = (id) => api.patch(`/retakes/${id}/reject`);
export const grantRetake = (id, data) => api.post(`/retakes/${id}/grant`, data);

// ================= PROCTORING =================
export const getProctorings = (params = {}) => api.get("/proctorings", { params });
export const getProctoringById = (id) => api.get(`/proctorings/${id}`);
export const createProctoring = (data) => api.post("/proctorings", data);

// Auth
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);

// Dashboard & Classes
export const getDashboard = () => api.get("/dashboard");
export const getMyClasses = () => api.get("/classManagement");
export const createClass = (data) => api.post("/classes", data);
export const updateClass = (classId, data) => api.patch(`/classes/${classId}`, data);
export const getClasses = (data) => api.get("/classes", data);
export const searchClasses = (data) => api.get("/classes", { params: data });
export const deleteClass = (classId) => api.delete(`/classes/${classId}`);

// Class Detail
export const getClassById = (classId, data) => api.get(`/classes/${classId}`, data);
export const getClassDetail = (classId) => api.get(`/classes/${classId}`);
export const addStudentsToClass = (classId, data) => api.post(`/classes/${classId}/students`, data);
export const inviteStudentToClass = (classId, data) => api.post(`/classes/${classId}/invite`, data);
export const bulkAddStudents = (classId, data) => api.post(`/classes/${classId}/students/bulk`, data);
export const searchStudent = (classId, data) => api.get(`/classes/${classId}/students?keyword`, data);
export const getClassExams = (classId) => api.get(`/classes/${classId}/sessions`);
export const removeStudentFromClass = (classId, studentId) => api.delete(`/classes/${classId}/students/${studentId}`);

// Question & Exam Banks
export const getQuestionBankSubject = () => api.get("/subjects/question-bank");
export const getQuestionList = (subjectId) => api.get(`/question-banks/${subjectId}`);
export const getQuestionAnswer = (questionId) => api.get(`/questions/${questionId}/answer`);
export const getQuestionForMe = (userId) => api.get("/questionForMe");
export const getExamBankSubject = () => api.get("/question-bank/subjects");
export const getExamForMe = () => api.get("/my/exam");
export const createQuestion = (data) => api.post("/question-banks", data);
export const updateQuestion = (data) => api.post("/question-bank/edit", data);
export const getExamDetail = (examId) => api.get(`/subject/exam/${examId}`);
export const getExamList = (subjectId) => api.get(`/subject/${subjectId}/exam`);
export const createExam = (data) => api.post("/exam/create", data);

export default api;