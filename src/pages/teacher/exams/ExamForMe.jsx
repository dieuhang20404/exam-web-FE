import { useEffect, useState } from "react";
import { Button, Modal, Input, message, Card } from "antd";
import SubjectLayout from "../../../components/SubjectLayout";
import { useNavigate } from "react-router-dom";
import { getTemplatesService } from "../../../services/templateService";
import { getSubjectsService, createSubjectService } from "../../../services/subjectService";
import {BookOutlined} from "@ant-design/icons";

import "./ExamForMe.css";

function ExamForMe() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [subjectName, setSubjectName] = useState("");

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= FETCH EXAM SUBJECTS =================
  const fetchSubjects = async () => {
    setLoading(true);
    try { 
      const data = await getSubjectsService();
      setSubjects(data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreateSubject = async () => {
    if (!subjectName.trim()) {
      message.warning("Nhập tên môn học");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const newSubject = await createSubjectService(subjectName);

      setSubjects((prev) => [
        ...prev,
        {
          subject_id: newSubject.subjectId,
          subject_name: newSubject.subjectName,
          total_exams: 0
        }
      ]);

      message.success("Tạo môn học thành công");
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
            navigate(`exam/${item.subjectId}`, {
              state: { preSelectedSubjectId: item.subjectId }
            })
          }
        >
          <div className="my-subject-card">
            <BookOutlined />
            <h3>{item.subjectName}</h3>
            <p>Số đề thi: {item.numberOfTemplates}</p>
            <small>Mã môn: {item.subjectId}</small> 
          </div>
        </Card>
      )}
    >
      <Button
        className="bt"
        onClick={() =>
          navigate("/teacher/createExam")
        }
      >
        + Tạo đề thi
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
        onCancel={() => setOpenCreateModal(false)}
        onOk={handleCreateSubject}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Input
          placeholder="Nhập tên môn học"
          value={subjectName}
          onChange={(e) =>
            setSubjectName(e.target.value)
          }
        />
      </Modal>
    </SubjectLayout>
  );
}

export default ExamForMe;