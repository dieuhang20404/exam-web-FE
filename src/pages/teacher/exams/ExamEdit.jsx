import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Card, Input, Select, Button, Table, Checkbox, InputNumber, message, Spin } from "antd";
import { DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { getSubjectsService } from "../../../services/subjectService";
import { getQuestionsBySubjectService } from "../../../services/questionService";
import { getTemplateByIdService, getTemplateQuestionsService, updateTemplateService } from "../../../services/templateService";
import "./CreateExam.css";  

function EditExam() {
  const { examId } = useParams(); 
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [loadingBank, setLoadingBank] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);

  const [examInfo, setExamInfo] = useState({
    templateName: "",
    subjectId: null,
  });

  const [filters, setFilters] = useState({
    search: "",
    difficulty: "all",
    type: "all"
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const totalExamScore = selectedQuestions.reduce((sum, q) => sum + (Number(q.score) || 0), 0);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchSubjects();
      await fetchOldExamDetails();
      setLoading(false);
    };
    initData();
  }, [examId]);

  useEffect(() => {
    if (examInfo.subjectId) {
      fetchQuestionBank(examInfo.subjectId);
    }
  }, [examInfo.subjectId]);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjectsService();
      const dataArray = Array.isArray(res.data) 
        ? res.data 
        : (Array.isArray(res.data?.data) ? res.data.data : []);
      setSubjects(dataArray);
    } catch (err) {
      setSubjects(mockSubject);
    }
  };
  const fetchOldExamDetails = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        getTemplateByIdService(examId),
        getTemplateQuestionsService(examId)
      ]);
      if (examRes) {
        setExamInfo({
          templateName: examRes.templateName || "",
          subjectId: examRes.subjectId ? Number(examRes.subjectId) : null,
        });
      }

      if (Array.isArray(questionsRes.data)) {
        const formattedQuestions = questionsRes.data.map((q) => ({
          questionId: q.questionId,
          score: Number(q.score) || 1,
          orderIndex: Number(q.orderIndex) || 1,
          data: q.data || {
            content: q.content,
            difficulty: q.difficulty,
            answers: q.answers
          }
        }));
        setSelectedQuestions(formattedQuestions);
      }
    } catch (err) {
      message.error("Không thể tải thông tin đề thi cũ!");
      console.error(err);
    }
  };

  const fetchQuestionBank = async (subjectId) => {
    setLoadingBank(true);
    try {
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const userId = user.userId || user.id || 1; 

      const res = await getQuestionsBySubjectService(subjectId, userId);
      setQuestionBank(Array.isArray(res) ? res : []);
    } catch (err) {
      setQuestionBank(mockQuestion[subjectId] || []);
    } finally {
      setLoadingBank(false);
    }
  };

  const filteredQuestions = questionBank.filter((q) => {
    const matchSearch = q.content?.toLowerCase().includes(filters.search.toLowerCase()) || false;
    let targetDifficulty = filters.difficulty;
    if (filters.difficulty === "Easy") targetDifficulty = 1;
    if (filters.difficulty === "Medium") targetDifficulty = 2;
    if (filters.difficulty === "Hard") targetDifficulty = 3;

    const matchDifficulty = filters.difficulty === "all" ? true : q.difficulty === targetDifficulty;
    return matchSearch && matchDifficulty;
  });

  const handleSelectQuestion = (checked, question) => {
    if (checked) {
      setSelectedQuestions([
        ...selectedQuestions,
        {
          questionId: question.questionId,
          score: 1, 
          orderIndex: selectedQuestions.length + 1,
          data: { ...question } // Gói vào object data cho trùng khớp cấu trúc BE trả về
        }
      ]);
    } else {
      const updated = selectedQuestions
        .filter((q) => q.questionId !== question.questionId)
        .map((q, index) => ({ ...q, orderIndex: index + 1 }));
      setSelectedQuestions(updated);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    const updated = selectedQuestions
      .filter((q) => q.questionId !== questionId)
      .map((q, index) => ({ ...q, orderIndex: index + 1 }));
    setSelectedQuestions(updated);
  };

  const handleUpdateExam = async () => {
    if (!examInfo.templateName.trim()) {
      message.warning("Vui lòng nhập tên đề thi!");
      return;
    }
    if (!examInfo.subjectId) {
      message.warning("Vui lòng chọn môn học!");
      return;
    }
    if (selectedQuestions.length === 0) {
      message.warning("Chọn ít nhất 1 câu hỏi vào đề!");
      return;
    }

    const payload = {
      subjectId: Number(examInfo.subjectId),
      templateName: examInfo.templateName,
      questions: selectedQuestions.map((q) => ({
        questionId: Number(q.questionId),
        score: Number(q.score) || 1,
        orderIndex: Number(q.orderIndex)
      }))
    };

    try {
      console.log("Payload cập nhật gửi lên BE:", payload);
      await updateTemplateService(examId, payload);
      message.success("Cập nhật đề thi thành công!");
      navigate("/teacher/examForMe");
    } catch (err) {
      message.error("Cập nhật đề thi thất bại!");
    }
  };

  const questionColumns = [
    {
      title: "",
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedQuestions.some((q) => q.questionId === record.questionId)}
          onChange={(e) => handleSelectQuestion(e.target.checked, record)}
        />
      )
    },
    {
      title: "Nội dung câu hỏi",
      dataIndex: "content"
    },
    {
      title: "Độ khó",
      dataIndex: "difficulty",
      width: 100,
      render: (val) => {
        if (val === 1) return "Dễ";
        if (val === 2) return "Trung bình";
        if (val === 3) return "Khó";
        return "Chưa rõ";
      }
    }
  ];
  const selectedColumns = [
    {
      title: "STT",
      dataIndex: "orderIndex",
      width: 70
    },
    {
      title: "Nội dung",
      render: (_, record) => record.data?.content || record.content
    },
    {
      title: "Điểm số",
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={0}
          step={0.25}
          value={record.score}
          onChange={(value) => {
            const updated = selectedQuestions.map((q) =>
              q.questionId === record.questionId ? { ...q, score: value } : q
            );
            setSelectedQuestions(updated);
          }}
        />
      )
    },
    {
      title: "Hành động",
      width: 100,
      render: (_, record) => (
        <DeleteOutlined
          style={{ color: "red", cursor: "pointer", fontSize: "16px" }}
          onClick={() => handleDeleteQuestion(record.questionId)}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        <Spin size="large" tip="Đang tải dữ liệu mẫu đề thi..." />
      </div>
    );
  }

  return (
    <div className="create-exam-page">
      <div className="exam-top">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <h1>Chỉnh sửa đề thi</h1>
        </div>
        <Button type="primary" className="save-btn" onClick={handleUpdateExam}>
          Cập nhật đề thi
        </Button>
      </div>

      <Card className="exam-info-card">
        <Row gutter={16}>
          <Col span={8}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Tên đề thi</label>
            <Input
              placeholder="Nhập tên đề"
              value={examInfo.templateName}
              onChange={(e) => setExamInfo({ ...examInfo, templateName: e.target.value })}
            />
          </Col>
          <Col span={8}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Môn học</label>
            <Select
              style={{ width: "100%" }}
              disabled // Khóa chọn môn khi sửa đề để tránh lỗi cấu trúc ngân hàng câu hỏi
              placeholder="Chọn môn học"
              value={examInfo.subjectId}
              options={subjects.map((s) => ({
                value: s.subjectId, 
                label: s.subjectName
              }))}
            />
          </Col>
          <Col span={8}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Tổng điểm đề thi</label>
            <div 
              style={{ 
                padding: "5px 12px", 
                background: "#f5f5f5", 
                border: "1px solid #d9d9d9", 
                borderRadius: "6px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                color: totalExamScore === 10 ? "#52c41a" : "#b58900"
              }}
            >
              {totalExamScore} điểm
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={20} style={{ marginTop: "20px" }}>
        <Col span={12}>
          <Card title="Kho ngân hàng câu hỏi môn học">
            <div className="filter-box" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <Input
                placeholder="Tìm nội dung câu hỏi..."
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Select
                value={filters.difficulty}
                style={{ width: 150 }}
                onChange={(value) => setFilters({ ...filters, difficulty: value })}
                options={[
                  { value: "all", label: "Tất cả độ khó" },
                  { value: "Easy", label: "Dễ" },
                  { value: "Medium", label: "Trung bình" },
                  { value: "Hard", label: "Khó" }
                ]}
              />
            </div>

            {loadingBank ? (
              <div style={{ textAlign: "center", padding: "20px" }}><Spin /></div>
            ) : (
              <Table
                rowKey="questionId"
                columns={questionColumns}
                dataSource={filteredQuestions}
                pagination={{ pageSize: 5 }}
              />
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card>
            <Table
              rowKey="questionId"
              title={() => <h3>Cấu trúc câu hỏi hiện tại trong đề ({selectedQuestions.length} câu)</h3>}
              columns={selectedColumns}
              dataSource={selectedQuestions}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default EditExam;