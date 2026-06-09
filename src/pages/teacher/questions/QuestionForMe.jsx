import { useEffect, useState } from "react";
import { Button, Modal, Input, message, Card } from "antd";
import SubjectLayout from "../../../components/SubjectLayout";
import { createSubject } from "../../../api/api";
import { getSubjectsService, createSubjectService } from "../../../services/subjectService";
import "./QuestionForMe.css";
import { useNavigate } from "react-router-dom";
import {BookOutlined} from "@ant-design/icons";

function QuestionForMe() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  useEffect(() => { fetchSubjects();}, []);
  const fetchSubjects = async () => {
    setLoading(true);
    try { 
      const data = await getSubjectsService();
      setSubjects(data.data);
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
        const newSubject = await createSubjectService(subjectName);
        setSubjects(prevSubjects => [...prevSubjects, newSubject.data]);
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
      items={subjects} 
      loading={loading}
      renderCard={(item) => (
        <Card 
          className="subject-card" 
          key={item.subjectId}
          onClick={() =>
            navigate(`question/${item.subjectId}`, {
              state: { preSelectedSubjectId: item.subjectId }
            })
          }
        >
          <div className="my-subject-card">
            <BookOutlined />
            <h3>{item.subjectName}</h3>
            <p>Số câu hỏi: {item.numberOfQuestions}</p>
            <small>Mã môn: {item.subjectId}</small> 
          </div>
        </Card>
      )}
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