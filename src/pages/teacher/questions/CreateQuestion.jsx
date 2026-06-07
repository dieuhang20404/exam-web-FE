import { useState, useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import QuestionFormLayout from "../../../components/QuestionFormLayout";
import { createQuestionService} from "../../../services/questionService";
import { getSubjectsService } from "../../../services/subjectService";
function CreateQuestion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] =
    useState({
      teacherId: user?.userId,
      subjectId: null,
      qType: "SINGLE_CHOICE",
      content: "",
      difficulty: "",
      answers: [
        {
          isCorrect: false,
          content: "",
          orderIndex: 1
        },
      ],
      correctAnswer: []
    })

  useEffect(() => {fetchSubjects();}, []);
  const fetchSubjects = async () => {
    setLoading(true);
    try { 
      const data = await getSubjectsService(user.userId);
      setSubjects(data);
    } catch (err) {
      console.log(err);
      message.error("Không tải được danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    await createQuestionService( formData, navigate);
  };

  return (
    <QuestionFormLayout
      title="Tạo câu hỏi"
      formData={formData}
      setFormData={setFormData}
      onSave={handleSave}
      subjects={subjects}
    />
  );
}

export default CreateQuestion;