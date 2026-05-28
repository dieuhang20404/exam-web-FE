// QuestionList.jsx

import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, Table, Tag, Spin, Empty, Input, Select, Modal, Button } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import QuestionFormLayout from "../../../components/QuestionFormLayout";
import { fetchQuestionsService, filterDifficultyService, searchQuestionService,
deleteQuestionService, updateQuestionService, fetchQuestionAnswerService } from "../../../services/questionService";
import "./QuestionList.css";

const { Search } = Input;


function QuestionList() {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isMine =
  location.pathname.includes("my-question");


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
    subject_id: Number(subjectId),
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

  useEffect(() => {fetchQuestions();}, [subjectId]);

  const fetchQuestions = async () => { 
      setLoading(true);
      try {
        const data = await fetchQuestionsService(subjectId, isMine);
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
      dataIndex: "question_id",
      key: "question_id",
      width: 90,
    },

    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
    },

    {
      title: "Độ khó",
      dataIndex: "difficulty",
      key: "difficulty",
      width: 130,
      render: (difficulty) => {
        const colorMap = {
          Easy: "green",
          Medium: "orange",
          Hard: "red",
        };

        return (
          <Tag color={colorMap[difficulty]}>
            {difficulty}
          </Tag>
        );
      },
    },

    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 160,
    },

    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
    },
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
              handleDelete(
                record.question_id
              );
            }}
          />
        </div>
      )
    });
  }

  const handleDelete = (id) => {
    const updated =deleteQuestionService( questions,id);
    setQuestions(updated);
    setFilteredQuestions(updated);
  };

  const handleEdit = ( question ) => {
    navigate(
      `/teacher/edit-question/${question.question_id}`,
      {
        state: {
          question
        }
      }
    );
  };

  const handleSaveEdit = async () => {
    await updateQuestionService(editData);
    setEditModal(false);
    fetchQuestions();
    message.success("Đã cập nhật");
  };

  const handleShowAnswer = async () => {
    const answers = await fetchQuestionAnswerService( selectedQuestion.question_id);
    setCorrectAnswers(answers);
    setShowAnswer(true);
  };

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
          rowKey="question_id"
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
              Câu hỏi #{selectedQuestion.question_id}
            </h2>

            <p className="modal-question">
              {selectedQuestion.content}
            </p>

            <div className="answer-list">

              {selectedQuestion.answers.map((ans, index) => (
                <div
                  key={index}
                  className={`answer-item ${
                    showAnswer && ans.correct
                      ? "correct-answer"
                      : ""
                  }`}
                >
                  {String.fromCharCode(65 + index)}.
                  {" "}
                  {ans.text}
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