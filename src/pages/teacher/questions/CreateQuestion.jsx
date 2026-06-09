import { useState, useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { parseNormalExamToQuestions } from "../../../utils/fileParser";
import QuestionFormLayout from "../../../components/QuestionFormLayout";
import { createQuestionService, createManyQuestionsService} from "../../../services/questionService";
import { getSubjectsService } from "../../../services/subjectService";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
function CreateQuestion() {
  const [formData, setFormData] = useState({
    subjectId: null,
    qType: "SINGLE_CHOICE",
    content: "",
    difficulty: 1,
    answers: [{ isCorrect: false, content: "", orderIndex: 1 }],
    correctAnswer: [],
    fileUpload: null // File đính kèm (.docx / .pdf)
  });
  
  const [subjects, setSubjects] = useState([]); 
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await getSubjectsService();
      setSubjects(data.data);
    } catch (err) {
      console.log(err);
      message.error("Không tải được danh sách môn học");
    }
  };
  const handleSaveQuestion = async () => {
    if (!formData.subjectId) {
      message.warning("Vui lòng chọn môn học trước khi lưu!");
      return;
    }
if (formData.fileUpload) {
  const file = formData.fileUpload;
  let fullText = "";

  try {
    if (file.name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      fullText = result.value;
    } 
    else if (file.name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let pdfText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        pdfText += pageText + "\n";
      }
      fullText = pdfText;
    } else {
      message.error("Định dạng tệp không hợp lệ! Vui lòng chọn file .docx hoặc .pdf");
      return;
    }
    const parsedQuestions = parseNormalExamToQuestions(fullText, formData.subjectId);

    if (parsedQuestions.length === 0) {
      message.warning("Không tìm thấy câu hỏi hoặc bảng đáp án khớp cấu trúc mẫu.");
      return;
    }
    await createManyQuestionsService(parsedQuestions);
    message.success(`Tuyệt vời! Đã nạp hàng loạt thành công ${parsedQuestions.length} câu hỏi từ file vào hệ thống.`);
    setFormData(prev => ({ ...prev, fileUpload: null }));

  } catch (error) {
    console.error("Lỗi khi import file câu hỏi:", error);
    message.error(error.message || "Xử lý file thất bại, hãy kiểm tra lại bảng đáp án đáy trang.");
  }
}
    else {
      if (!formData.content) {
        message.warning("Vui lòng điền nội dung câu hỏi!");
        return;
      }

      const payload = {
        subjectId: formData.subjectId,
        qType: formData.qType === "SINGLE_CHOICE" ? "single" : 
               formData.qType === "MULTIPLE_CHOICE" ? "multiple" : "true_false",
        content: formData.content,
        difficulty: formData.difficulty ? Number(formData.difficulty) : 1, 
        answers: formData.answers.map((answer, index) => ({
          content: answer.content,
          orderIndex: String.fromCharCode(65 + index),
          isCorrect: formData.correctAnswer.includes(index)
        }))
      };

      try {
        await createQuestionService(payload);
        message.success("Tạo câu hỏi thủ công thành công!");
      } catch (err) {
        message.error("Không thể lưu câu hỏi. Vui lòng kiểm tra lại thông tin.");
      }
    }
  };
  return (
    <QuestionFormLayout
      title="Tạo câu hỏi mới"
      formData={formData}
      setFormData={setFormData}
      subjects={subjects}
      onSave={handleSaveQuestion} 
    />
  );
}
export default CreateQuestion;