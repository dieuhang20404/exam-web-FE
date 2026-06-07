import {createSession, updateSession, getSessions, getSessionById, deleteSession} from "../api/sessionApi";

// Tạo phiên kiểm tra
export const createSessionService = async (formData) => {
    const res = await createSession(formData);
    return res.data;
};

// Cập nhật phiên kiểm tra
export const updateSessionService = async (sessionId, formData) => {
    const res = await updateSession(sessionId, formData);
    return res.data;
};

// Lấy danh sách phiên kiểm tra
export const getSessionsService = async (query = {}) => {
    const res = await getSessions(query);
    return res.data;
};

// Lấy chi tiết phiên kiểm tra
export const getSessionByIdService = async (sessionId) => {
    const res = await getSessionById(sessionId);
    return res.data;
};

// Xóa phiên kiểm tra
export const deleteSessionService = async (sessionId) => {
    await deleteSession(sessionId);
    return true;
};