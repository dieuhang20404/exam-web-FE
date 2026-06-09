import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {Card, Table, Tag, Spin, Empty, Input, Select, Modal,Button, message} from "antd";

import {EditOutlined, DeleteOutlined} from "@ant-design/icons";

import {getQuestionsBySubjectService, deleteQuestionService} from "../../../services/questionService";

import "./QuestionList.css";

const { Search } = Input;

function QuestionList() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [questions, setQuestions] =
    useState([]);

  const [filteredQuestions, setFilteredQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [difficulty, setDifficulty] =
    useState("all");

  const [selectedQuestion, setSelectedQuestion] =
    useState(null);

  const [openModal, setOpenModal] =
    useState(false);

  const [showAnswer, setShowAnswer] =
    useState(false);

  const difficultyMap = {
    1: "EASY",
    2: "MEDIUM",
    3: "HARD"
  };

  useEffect(() => {
    fetchQuestions();
  }, [subjectId]);

  const fetchQuestions = async () => {
    setLoading(true);

    try {
      const data =
        await getQuestionsBySubjectService(
          subjectId,
          user.userId
        );

      setQuestions(data);
      setFilteredQuestions(data);
    } catch (err) {
      console.log(err);
      message.error(
        "Không tải được danh sách câu hỏi"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultyChange = (
    value
  ) => {
    setDifficulty(value);

    if (value === "all") {
      setFilteredQuestions(
        questions
      );
      return;
    }

    const mapping = {
      EASY: 1,
      MEDIUM: 2,
      HARD: 3
    };

    const filtered =
      questions.filter(
        (q) =>
          q.difficulty ===
          mapping[value]
      );

    setFilteredQuestions(
      filtered
    );
  };

  const handleSearch = (
    value
  ) => {
    if (!value.trim()) {
      setFilteredQuestions(
        questions
      );
      return;
    }

    const filtered =
      questions.filter((q) =>
        q.content
          ?.toLowerCase()
          .includes(
            value.toLowerCase()
          )
      );

    setFilteredQuestions(
      filtered
    );
  };

  const handleDelete = async (
    id
  ) => {
    try {
      await deleteQuestionService(
        id
      );

      const updated =
        questions.filter(
          (q) =>
            q.questionId !== id
        );

      setQuestions(updated);
      setFilteredQuestions(
        updated
      );

      message.success(
        "Xóa thành công"
      );
    } catch (err) {
      console.log(err);
      message.error(
        "Xóa thất bại"
      );
    }
  };

  const handleEdit = (
    question
  ) => {
    navigate(
      `/teacher/edit-question/${question.questionId}`,
      {
        state: { question }
      }
    );
  };

  const handleShowAnswer =
    () => {
      setShowAnswer(true);
    };

  const columns = [
    {
      title: "ID",
      dataIndex:
        "questionId",
      width: 90
    },

    {
      title: "Nội dung",
      dataIndex:
        "content"
    },

    {
      title: "Độ khó",
      dataIndex:
        "difficulty",
      width: 130,
      render: (
        difficulty
      ) => {
        const level =
          difficultyMap[
            difficulty
          ];

        const colorMap = {
          EASY: "green",
          MEDIUM:
            "orange",
          HARD: "red"
        };

        return (
          <Tag
            color={
              colorMap[
                level
              ]
            }
          >
            {level}
          </Tag>
        );
      }
    },

    {
      title: "Loại",
      dataIndex: "qType",
      width: 150
    },

    {
      title: "Thao tác",
      width: 120,
      render: (
        _,
        record
      ) => (
        <div
          style={{
            display:
              "flex",
            gap: 12
          }}
        >
          <EditOutlined
            style={{
              color:
                "#1677ff",
              cursor:
                "pointer"
            }}
            onClick={(
              e
            ) => {
              e.stopPropagation();
              handleEdit(
                record
              );
            }}
          />

          <DeleteOutlined
            style={{
              color:
                "red",
              cursor:
                "pointer"
            }}
            onClick={(
              e
            ) => {
              e.stopPropagation();
              handleDelete(
                record.questionId
              );
            }}
          />
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="question-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (
    !questions ||
    questions.length === 0
  ) {
    return (
      <Empty description="Không có câu hỏi nào" />
    );
  }

  return (
    <div className="question-container">

      <div className="question-header">

        <Button
          className="bt-back"
          onClick={() =>
            navigate(
              "/teacher/questionForMe"
            )
          }
        >
          ← Quay lại
        </Button>

        <div className="question-actions">

          <Search
            placeholder="Tìm câu hỏi..."
            allowClear
            onSearch={
              handleSearch
            }
            className="search-box"
          />

          <Select
            value={
              difficulty
            }
            onChange={
              handleDifficultyChange
            }
            className="difficulty-select"
            options={[
              {
                value:
                  "all",
                label:
                  "Tất cả"
              },
              {
                value:
                  "EASY",
                label:
                  "Easy"
              },
              {
                value:
                  "MEDIUM",
                label:
                  "Medium"
              },
              {
                value:
                  "HARD",
                label:
                  "Hard"
              }
            ]}
          />

        </div>
      </div>

      <Card className="table-card">

        <Table
          columns={columns}
          dataSource={
            filteredQuestions
          }
          rowKey="questionId"
          pagination={{
            pageSize: 5
          }}
          onRow={(
            record
          ) => ({
            onClick: () => {
              setSelectedQuestion(
                record
              );

              setOpenModal(
                true
              );

              setShowAnswer(
                false
              );
            }
          })}
        />

      </Card>

      <Modal
        open={openModal}
        footer={null}
        width={700}
        onCancel={() =>
          setOpenModal(
            false
          )
        }
      >
        {selectedQuestion && (
          <div className="question-modal">

            <h2>
              Câu hỏi #
              {
                selectedQuestion.questionId
              }
            </h2>

            <p className="modal-question">
              {
                selectedQuestion.content
              }
            </p>

            <div className="answer-list">

              {selectedQuestion.answers?.map(
                (
                  ans,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className={`answer-item ${
                      showAnswer &&
                      ans.isCorrect
                        ? "correct-answer"
                        : ""
                    }`}
                  >
                    {String.fromCharCode(
                      65 +
                        index
                    )}
                    .{" "}
                    {
                      ans.content
                    }
                  </div>
                )
              )}

            </div>

            <Button
              type="primary"
              className="answer-btn"
              onClick={
                handleShowAnswer
              }
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