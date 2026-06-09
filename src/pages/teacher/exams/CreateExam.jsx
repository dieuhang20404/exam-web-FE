import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Row, Col, Card, Input, Select, Button, Table, Checkbox, InputNumber, Upload, message, Spin } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { getSubjectsService } from "../../../services/subjectService";
import { getQuestionsBySubjectService } from "../../../services/questionService"; 
import { createTemplateService } from "../../../services/templateService";
import "./CreateExam.css";


function CreateExam() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [sourceType, setSourceType] = useState("bank");

  const [examInfo, setExamInfo] = useState({
    template_name: "",
    subjectId: null, 
    duration: 45
  });

  const [filters, setFilters] = useState({
    search: "",
    difficulty: "all",
    type: "all"
  });

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  useEffect(() => {
    fetchSubjects();
  }, []);
  useEffect(() => {
    const preSelectedId = location.state?.preSelectedSubjectId;
    if (preSelectedId && subjects.length > 0) {
      setExamInfo((prev) => ({ ...prev, subjectId: Number(preSelectedId) }));
    }
  }, [location.state, subjects]);

  useEffect(() => {
    if (examInfo.subjectId) {
      fetchQuestionBank(examInfo.subjectId);
    }
  }, [examInfo.subjectId]);

  const fetchSubjects = async () => {
    try {
      const res = await getSubjectsService();
      console.log("Dữ liệu thô môn học (res.data):", res.data);

      // KIỂM TRA CHUẨN: Nếu bản thân res.data là mảng thì lấy luôn, 
      // ngược lại nếu nó là object chứa thuộc tính data là mảng thì mới lấy res.data.data
      const dataArray = Array.isArray(res.data) 
        ? res.data 
        : (Array.isArray(res.data?.data) ? res.data.data : []);

      setSubjects(dataArray);
      console.log("Mảng môn học sau khi xử lý thành công:", dataArray);
    } catch (err) {
      console.log("API subject lỗi -> dùng mockSubject", err);
      setSubjects(mockSubject);
    }
  };

  const fetchQuestionBank = async (subjectId) => {
    setLoading(true);
    try {
      const res = await getQuestionsBySubjectService(subjectId);
      console.log("Dữ liệu thô câu hỏi (res.data):", res);

      // Tương tự, kiểm tra động cấu trúc mảng câu hỏi từ Backend trả về
      const questionsData = Array.isArray(res) ? res : [];

      setQuestionBank(questionsData);
      console.log("Mảng ngân hàng câu hỏi sau khi xử lý thành công:", questionsData);
    } catch (err) {
      console.log("API question lỗi -> dùng mockQuestion", err);
      setQuestionBank(mockQuestion[subjectId] || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questionBank.filter((q) => {
    const matchSearch = q.content?.toLowerCase().includes(filters.search.toLowerCase()) || false;
    
    let targetDifficulty = filters.difficulty;
    if (filters.difficulty === "Easy") targetDifficulty = 1;
    if (filters.difficulty === "Medium") targetDifficulty = 2;
    if (filters.difficulty === "Hard") targetDifficulty = 3;

    const matchDifficulty = filters.difficulty === "all" ? true : q.difficulty === targetDifficulty;
    const matchType = filters.type === "all" ? true : q.qType === filters.type; 
    
    return matchSearch && matchDifficulty && matchType;
  });

  const handleSelectQuestion = (checked, question) => {
    if (checked) {
      setSelectedQuestions([
        ...selectedQuestions,
        {
          ...question,
          score: 1,
          orderIndex: selectedQuestions.length + 1 
        }
      ]);
    } else {
      const updated = selectedQuestions
        .filter((q) => q.questionId !== question.questionId)
        .map((q, index) => ({
          ...q,
          orderIndex: index + 1
        }));
      setSelectedQuestions(updated);
    }
  };

  const handleDeleteQuestion = (questionId) => {
    const updated = selectedQuestions
      .filter((q) => q.questionId !== questionId)
      .map((q, index) => ({
        ...q,
        orderIndex: index + 1
      }));
    setSelectedQuestions(updated);
  };

  const handleUploadFile = async (file) => {
    try {
      setLoading(true);
      const text = await file.text();
      const parsedQuestions = parseQuestionsFromText(text);
      setQuestionBank(parsedQuestions);
      message.success("Đọc file câu hỏi thành công!");
    } catch (err) {
      console.error(err);
      message.error("Không đọc được file");
    } finally {
      setLoading(false);
    }
    return false; 
  };

  const parseQuestionsFromText = (text) => {
    const blocks = text.trim().split("\n\n");
    return blocks.map((block, index) => {
      const lines = block.split("\n");
      return {
        questionId: Date.now() + index, 
        content: lines[0] || "Câu hỏi không có nội dung",
        difficulty: 1,
        qType: "single",
        answers: [
          { content: lines[1] || "", isCorrect: false },
          { content: lines[2] || "", isCorrect: true }
        ]
      };
    });
  };

  const handleSaveExam = async () => {
    if (!examInfo.template_name.trim()) {
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
      templateName: examInfo.template_name,
      questions: selectedQuestions.map((q) => ({
        questionId: Number(q.questionId),
        score: Number(q.score) || 1,
        orderIndex: Number(q.orderIndex)
      }))
    };

    try {
      await createTemplateService(payload);
      message.success("Tạo đề thi thành công!");
      navigate("/teacher/examForMe");
    } catch (err) {
      console.log("API lỗi -> Lưu tạm xuống LocalStorage");
      const oldExams = JSON.parse(localStorage.getItem("my_exams")) || [];
      localStorage.setItem(
        "my_exams",
        JSON.stringify([
          ...oldExams,
          {
            template_id: Date.now(),
            ...examInfo,
            questions: selectedQuestions
          }
        ])
      );
      message.success("Mất kết nối API đề thi, đã lưu tạm dữ liệu offline.");
      navigate("/teacher/examForMe");
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
        return "Chưa xác định";
      }
    },
    {
      title: "Loại câu hỏi",
      dataIndex: "qType",
      width: 120,
      render: (val) => (val === "single" ? "1 đáp án" : val === "truefalse" ? "Đúng / Sai" : "Nhiều đáp án")
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
      dataIndex: "content"
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
  // Tự động tính tổng điểm dựa trên danh sách câu hỏi đã chọn
  const totalExamScore = selectedQuestions.reduce((sum, q) => sum + (Number(q.score) || 0), 0);

  return (
    <div className="create-exam-page">
      <div className="exam-top">
        <h1>Tạo đề thi mới</h1>
        <Button type="primary" className="save-btn" onClick={handleSaveExam}>
          Lưu đề thi
        </Button>
      </div>

      <Card className="exam-info-card">
        <Row gutter={16}>
          <Col span={8}>
            <label style={{ display: "block", marginBottom: "8px" }}>Tên đề thi</label>
            <Input
              placeholder="Nhập tên đề"
              value={examInfo.template_name}
              onChange={(e) => setExamInfo({ ...examInfo, template_name: e.target.value })}
            />
          </Col>
          <Col span={8}>
            <label style={{ display: "block", marginBottom: "8px" }}>Môn học</label>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn môn học"
              value={examInfo.subjectId}
              options={subjects.map((s) => ({
                value: s.subjectId || s.subject_id,
                label: s.subjectName || s.subject_name
              }))}
              onChange={(value) => {
                setSelectedQuestions([]);
                setExamInfo({ ...examInfo, subjectId: value });
              }}
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
              }}
            >
              {totalExamScore} điểm
            </div>
          </Col>
        </Row>
      </Card>

      {/* <div className="source-box" style={{ margin: "20px 0" }}>
        <Button
          type={sourceType === "bank" ? "primary" : "default"}
          onClick={() => setSourceType("bank")}
          style={{ marginRight: "10px" }}
        >
          Ngân hàng câu hỏi
        </Button>
        <Button
          type={sourceType === "upload" ? "primary" : "default"}
          onClick={() => setSourceType("upload")}
        >
          Upload PDF/Word/TXT
        </Button>
      </div> */}

      {sourceType === "upload" && (
        <Card className="upload-card">
          <Upload beforeUpload={handleUploadFile} showUploadList={true} accept=".txt,.pdf,.doc,.docx">
            <Button icon={<UploadOutlined />}>Bấm để chọn File đề thi</Button>
          </Upload>
        </Card>
      )}

      {sourceType === "bank" && (
        <Row gutter={20}>
          <Col span={12}>
            <Card className="question-bank-card" title="Kho ngân hàng câu hỏi">
              <div className="filter-box" style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <Input
                  placeholder="Tìm nội dung..."
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

              {loading ? (
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
            <Card className="selected-question-card">
              <Table
                rowKey="questionId"
                title={() => <h3>Cấu trúc câu hỏi trong đề ({selectedQuestions.length} câu)</h3>}
                columns={selectedColumns}
                dataSource={selectedQuestions}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default CreateExam;