// QuestionList.jsx

import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, Table, Tag, Spin, Empty, Input, Select, Modal, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import QuestionFormLayout from "../../../components/QuestionFormLayout";
import { getQuestionsBySubjectService, deleteQuestionService } from "../../../services/questionService";
import "./QuestionList.css";

const { Search } = Input;


function QuestionList() {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isMine = location.pathname.includes("my-question");
  const user = JSON.parse(localStorage.getItem("user"));
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState("all");

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  const [editModal, setEditModal] = useState(false);

  const [editData, setEditData] = useState({
    subjectId: Number(subjectId),
    content: "",
    qType: "1",
    difficulty: "0",
    answers: [
      {
        isCorrect: false,
        content: "",
        orderIndex: 1
      },
    ],
    correctAnswer: []
  });

  useEffect(() => {fetchQuestions();}, [subjectId]);

  const fetchQuestions = async () => { 
      setLoading(true);
      try {
        const data = await getQuestionsBySubjectService(subjectId, user.userId);
        setQuestions(data);
        setFilteredQuestions(data);
      } finally {
        setLoading(false);
      }
    };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
    const filtered = filterDifficultyService(questions, value);
    setFilteredQuestions(filtered);
  };

  const handleSearch = (value) => {
    const filtered = searchQuestionService(questions,value);
    setFilteredQuestions(filtered);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "questionId",
      key: "questionId",
      width: 90
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content"
    },
    {
      title: "Độ khó",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 130,
      render: (difficulty) => {
        const colorMap = {
          EASY: "green",
          MEDIUM: "orange",
          HARD: "red"
        };
        return (
          <Tag color={colorMap[difficulty]}>
            {difficulty}
          </Tag>
        );
      }
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 120
    },
    {
      title: "Loại",
      dataIndex: "qType",
      key: "qType",
      width: 180
    }
  ];
  if (isMine) {
    columns.push({
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            gap: 12
          }}
        >
          <EditOutlined
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          />

          <DeleteOutlined
            style={{
              color: "red",
              cursor: "pointer"
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record.questionId);
            }}
          />
        </div>
      )
    });
  }

  const handleDelete = async (id) => {
    try {
      await deleteQuestionService(id);
      const updated = questions.filter(q => q.questionId !== id);
      setQuestions(updated);
      setFilteredQuestions(updated);
      message.success("Xóa thành công");
    } catch (err) {
      message.error("Xóa thất bại");
    }
  };

  const handleEdit = ( question ) => {
    navigate(
      `/teacher/edit-question/${question.questionId}`,
      {
        state: {question}
      }
    );
  };
  

  const handleSaveEdit = async () => {
    await updateQuestionService(editData);
    setEditModal(false);
    fetchQuestions();
    message.success("Đã cập nhật");
  };

 const handleShowAnswer = () => {setShowAnswer(true);};

  if (loading) {
    return (
      <div className="question-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Empty description="Không có câu hỏi nào" />
    );
  }

  return (
    <div className="question-container">

      {/* HEADER */}
      <div className="question-header">
       <div>
          <Button
            className="bt-back"
            onClick={() =>
              navigate(
                isMine
                  ? "/teacher/questionForMe"
                  : "/teacher/questionBankSubject"
              )
            }
          >
            ← Quay lại
          </Button>
        </div>
        <div className="question-actions">

          <Search
            placeholder="Tìm câu hỏi..."
            allowClear
            onSearch={handleSearch}
            className="search-box"
          />

          <Select
            value={difficulty}
            onChange={handleDifficultyChange}
            className="difficulty-select"
            options={[
              { value: "all", label: "Tất cả" },
              { value: "Easy", label: "Easy" },
              { value: "Medium", label: "Medium" },
              { value: "Hard", label: "Hard" },
            ]}
          />
        </div>
      </div>

      {/* TABLE */}
      <Card className="table-card">

        <Table
          columns={columns}
          dataSource={filteredQuestions}
          rowKey="questionId"
          pagination={{ pageSize: 5 }}
          onRow={(record) => ({
            onClick: () => {
              setSelectedQuestion(record);
              setOpenModal(true);
              setShowAnswer(false);
            },
          })}
        />

      </Card>

      {/* MODAL */}
      <Modal
        open={openModal}
        footer={null}
        onCancel={() => setOpenModal(false)}
        width={700}
      >
        {selectedQuestion && (
          <div className="question-modal">

            <h2>
              Câu hỏi #{selectedQuestion.questionId}
            </h2>

            <p className="modal-question">
              {selectedQuestion.content}
            </p>

            <div className="answer-list">

              {selectedQuestion.answers.map((ans, index) => (
                <div
                  key={index}
                  className={`answer-item ${
                    showAnswer && ans.isCorrect
                      ? "correct-answer"
                      : ""
                  }`}
                >
                  {String.fromCharCode(65 + index)}.
                  {" "}
                  {ans.content}
                </div>
              ))}

            </div>

            <Button
              type="primary"
              className="answer-btn"
              onClick={handleShowAnswer}
            >
              Xem đáp án đúng
            </Button>

          </div>
        )}
      </Modal>
    </div>
  );
}

export default QuestionList;