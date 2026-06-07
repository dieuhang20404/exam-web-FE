import {createTemplate, updateTemplate, getTemplates, getTemplateById, deleteTemplate, getTemplateQuestions} from "../api/templateApi";

// Tạo mẫu đề
export const createTemplateService = async (formData) => {
    const res = await createTemplate(formData);
    return res.data;
};

// Cập nhật mẫu đề
export const updateTemplateService = async (templateId, formData) => {
    const res = await updateTemplate(templateId, formData);
    return res.data;
};

// Danh sách mẫu đề
export const getTemplatesService = async (query = {}) => {
    const res = await getTemplates(query);
    return res.data;
};

// Chi tiết mẫu đề
export const getTemplateByIdService = async (templateId) => {
    const res = await getTemplateById(templateId);
    return res.data;
};

// Xóa mẫu đề
export const deleteTemplateService = async (templateId) => {
    await deleteTemplate(templateId);
    return true;
};

// Danh sách câu hỏi của mẫu đề
export const getTemplateQuestionsService = async (templateId) => {
    const res = await getTemplateQuestions(templateId);
    return res.data;
};