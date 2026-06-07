import { createSubject, getSubjects } from "../api/api";
import { mockSubject } from "../mock/mockSubject";
//Tạo môn học mới
export const createSubjectService = async (teacherId, subjectName) => {
    const payload = { teacherId, subjectName };
    const res = await createSubject(payload);
    return res.data;
};

//Lấy danh sách môn học trong ngân hàng câu hỏi của giáo viên
// export const getSubjectsService = async (teacherId) => {
//     try{
//         const payload = { teacherId };
//         const res = await getSubjects(payload);
//         return res.data;
//     }catch(err){
//         return questionForMeMock;
//     }
    
// };

export const getSubjectsService = async (teacherId = null) => {
    try {
        const payload = teacherId ? { teacherId } : {}; 
        const res = await getSubjects(payload);
        return res.data || [];
    } catch (err) {
        console.error("Lỗi khi lấy danh sách môn học:", err);
        return mockSubject; 
    }
};
//Lấy tất cả môn học trong ngân hàng câu hỏi