import { useEffect, useState } from "react";
import { Button, Modal, Input, message } from "antd";
import SubjectLayout from "../../../components/SubjectLayout";
import { createSubject, getMySubjects } from "../../../api/api";
import { fetchMySubjectsService } from "../../../services/questionService";
import "./QuestionForMe.css";
import { useNavigate } from "react-router-dom";

function QuestionForMe() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { fetchSubjects();}, []);
  
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await fetchMySubjectsService();
      setSubjects(data);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SubjectLayout
      subjects={subjects}
      loading={loading}
      currentTab="mine"
    >
      <Button
        className="bt"
        onClick={() =>
          navigate("/teacher/createQuestion")
        }
      >
        + Thêm câu hỏi
      </Button>
    </SubjectLayout>
  );
}

export default QuestionForMe;