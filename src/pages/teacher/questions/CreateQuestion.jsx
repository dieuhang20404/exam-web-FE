import { useState, useEffect } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

import QuestionFormLayout from "../../../components/QuestionFormLayout";
import { fetchMySubjectsService, createQuestionService} from "../../../services/questionService";

function CreateQuestion() {
  const navigate = useNavigate();

  const [subjects, setSubjects] =
    useState([]);

  const [formData, setFormData] =
    useState({
      subject_id: null,
      content: "",
      type: "1",
      difficulty_level: "0",

      answers: [
        { id: 1, text: "" },
        { id: 2, text: "" },
        { id: 3, text: "" },
        { id: 4, text: "" }
      ],

      correctAnswer: []
    });

  useEffect(() => {fetchMySubjectsService(setSubjects);}, []);

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