

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", 
  timeout: 5000,
});

// ================= REQUEST =================
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

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      // localStorage.removeItem("token");
      // window.location.href = "/login";
      console.log("Phát hiện lỗi 401 nhưng đã chặn không cho đá ra ngoài!");
    }

    return Promise.reject(error);
  }
);

// ================= API FUNCTIONS =================

// ================= SESSIONS =================

export const getSessions = (params = {}) =>
  api.get("/sessions", { params });

export const getSessionById = (
  id
) =>
  api.get(`/sessions/${id}`);

  // ================= ATTEMPTS =================



export const createAttempt = (data) =>
  api.post("/attempts", data);

export const updateAttempt = (
  attemptId,
  data
) =>
  api.patch(
    `/attempts/${attemptId}`,
    data
  );

export const submitAttempt = (
  attemptId,
  data
) =>
  api.patch(
    `/attempts/${attemptId}/submit`,
    data
  );

export const getAttempts = (
  params = {}
) =>
  api.get("/attempts", {
    params,
  });

export const getCurrentAttempt = () =>
  api.get("/attempts/current");

export const getAttemptById = (
  id
) =>
  api.get(`/attempts/${id}`);

// ================= QUESTIONS =================

export const getQuestions = (params = {}) =>
  api.get("/questions", { params });

export const getQuestionById = (id) =>
  api.get(`/questions/${id}`);

// ================= TEMPLATES =================

export const getTemplates = (params = {}) =>
  api.get("/templates", { params });

export const getTemplateById = (id) =>
  api.get(`/templates/${id}`);

export const getTemplateQuestions = (
  id
) =>
  api.get(
    `/templates/${id}/questions`
  );

// ================= NOTIFICATIONS =================

export const getNotifications = (params = {}) =>
  api.get("/notifications", { params });

export const getNotificationById = (id) =>
  api.get(`/notifications/${id}`);

export const updateNotification = (id, data) =>
  api.patch(`/notifications/${id}`, data);
// ================= SUBJECTS =================

// export const getSubjects = (params = {}) =>
//   api.get("/subjects", { params });

export const getSubjectById = (id) =>
  api.get(`/subjects/${id}`);
// ================= USERS =================

export const getUsers = (params = {}) =>
  api.get("/users", { params });

export const getUserById = (id) =>
  api.get(`/users/${id}`);

export const createUser = (data) =>
  api.post("/users", data);

export const getMyProfile = () =>
  api.get("/users/me");

export const updateMyProfile = (data) =>
  api.patch("/users/me", data);

export const changePassword = (data) =>
  api.patch("/users/password", data);
// ================= RETAKES =================

export const getRetakes = (params = {}) =>
  api.get("/retakes", { params });

export const getRetakeById = (id) =>
  api.get(`/retakes/${id}`);

export const createRetake = (data) =>
  api.post("/retakes", data);

export const rejectRetake = (id) =>
  api.patch(`/retakes/${id}/reject`);

export const grantRetake = (id, data) =>
  api.post(`/retakes/${id}/grant`, data);

// ================= PROCTORING =================

export const getProctorings = (params = {}) =>
  api.get("/proctorings", { params });

export const getProctoringById = (id) =>
  api.get(`/proctorings/${id}`);

export const createProctoring = (data) =>
  api.post("/proctorings", data);


// login
export const login = (data) => {
  return api.post("/auth/login", data);
};

export const register = (data) => {
  return api.post("/auth/register", data);
};

// dashboard
export const getDashboard = () => {
  return api.get("/dashboard");
};

// classManagement
export const getMyClasses = () => {
  return api.get("/classManagement");
};

export const createClass = (data) => {
  return api.post("/classes", data);
};

export const updateClass = (classId, data) => {
  return api.patch(`/classes/${classId}`, data)
};

export const getClasses = ( data ) => { //userId, role
  return api.get("/classes", data);
};

export const searchClasses = ( data ) => { // data chứa { page, limit, keyword }
  return api.get("/classes", {
    params: data // <-- Ép Axios gửi data dưới dạng query parameters (?page=1&limit=10...)
  });
};

// classDetail
export const getClassById = ( classId, data) => { // userId, role 
  return api.get(`/classes/${classId}`, data);
};

export const getClassDetail = (classId) => {
  return api.get(`/classes/${classId}`);
};

export const addStudentsToClass = (classId, data) => { //teacherId, studentIds
  return api.post(`/classes/${classId}/students`, data)
};

export const inviteStudentToClass = (classId, data) => {
  return api.post(`/classes/${classId}/invite`, data);
};

export const bulkAddStudents = (classId, data) => {
  return api.post(`/classes/${classId}/students/bulk`, data);
}; 

export const searchStudent = (classId, data) => {
  return api.get(`/classes/${classId}/students?keyword`, data);
}; 

export const getClassExams = (classId) => {
  return api.get(`/classes/${classId}/sessions`);
}

export const removeStudentFromClass = (classId,studentId) => {
  return api.delete(`/classes/${classId}/students/${studentId}`);
};


// questionBankSubject
export const getQuestionBankSubject = () => {
  return api.get("/subjects/question-bank");
};

// questionList
export const getQuestionList = (subjectId) => {
  return api.get(`/question-banks/${subjectId}`);
};

export const getQuestionAnswer = (questionId) => {
    return api.get(`/questions/${questionId}/answer`);
};
//GET /questions/import-preview

// questionForMe
export const getQuestionForMe = (userId) => {
  return api.get("/questionForMe");
};
export const deleteClass = (classId) => {
  return api.delete(`/classes/${classId}`);
};

export const createSubject = (data) => {
  return api.post("/subjects", data);
};

export const getSubjects = (data) => { // data chứa { teacherId }
  return api.get("/subjects", {ưparams: data});
};




// examBankSubject
export const getExamBankSubject = () => {
  return api.get("/question-bank/subjects");
};

// examForMe
export const getExamForMe = () => {
  return api.get("/my/exam");
};

//CreateSession

//CreateQuestion 
export const createQuestion = (data) => { //techerId, subjectId, qType, content, difficulty, answers [isCorrect, content, orderIndex]
  return api.post("/question-banks", data);
}

//EditQuestion
export const updateQuestion = (data) => {
  return api.post("/question-bank/edit", data);
}

//ExamDetail
export const getExamDetail = (examId) => {
  return api.get("`/subject/exam/${examId}`");
}

//ExamList
export const getExamList = (subjectId) => {
  return api.get(`/subject/${subjectId}/exam`);
};

//CreateExam
export const createExam = (data) => {
  return api.post("/exam/create", data)
}

export default api;


