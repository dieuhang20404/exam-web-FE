import { useEffect, useState } from "react";
import { Button, Modal, Input, message } from "antd";
import SubjectLayout from "../../../components/SubjectLayout";
import { createSubject } from "../../../api/api";
import { getSubjectsService, createSubjectService } from "../../../services/subjectService";
import { getQuestionsService  } from "../../../services/questionService";
import "./QuestionForMe.css";
import { useNavigate } from "react-router-dom";

function QuestionForMe() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  useEffect(() => { fetchSubjects();}, []);
  const user = JSON.parse(localStorage.getItem("user"));
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

  const handleCreateSubject = async () => {
      if (!subjectName.trim()) {
        message.warning("Nhập tên môn học");
        return;
      }
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const newSubject = await createSubjectService(user.userId, subjectName);
        setSubjects([...subjects,newSubject]);
        message.success("Tạo môn học thành công" );
        setOpenCreateModal(false);
        setSubjectName("");
      } catch (err) {
        console.log(err);
        message.error("Tạo môn học thất bại");
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
      <Button
        className="bt"
        onClick={() => setOpenCreateModal(true)}
      >
        + Thêm môn học
      </Button>
      <Modal
        title="Thêm môn học"
        open={openCreateModal}
        onCancel={() =>
          setOpenCreateModal(false)
        }
        onOk={handleCreateSubject}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Input
          placeholder="Nhập tên môn học"
          value={subjectName}
          onChange={(e) =>
            setSubjectName(
              e.target.value
            )
          }
        />
      </Modal>
    </SubjectLayout>
  );
}

export default QuestionForMe;