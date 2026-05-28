import { useEffect, useState } from "react";
import { Button } from "antd";
import ExamLayout from "../../../components/ExamLayout";
import "./ExamForMe.css";
import { useNavigate } from "react-router-dom";

function ExamForMe() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const myExamSubjects = [
    {
      subject_id: 1,
      subject_name: "Java",
      total_exams: 5
    },
    {
      subject_id: 2,
      subject_name: "ReactJS",
      total_exams: 3
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubjects(myExamSubjects);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ExamLayout
      subjects={subjects}
      loading={loading}
      currentTab="mine"
    >
      <Button 
        className="bt"
        onClick={() => {
          navigate("/teacher/createExam");
        }}>
        + Tạo đề thi
      </Button>
    </ExamLayout>
  );
}

export default ExamForMe;