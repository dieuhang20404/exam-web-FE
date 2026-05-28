
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Row, Col, Card, Input, Select, Button, Table, Checkbox, InputNumber, Upload, message, Spin } from "antd";

import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";

import { getSubjects, getQuestionBankSubject, createExam } from "../../../api/api";

import { mockQuestion } from "../../../mock/questionMock";
import { mockSubject } from "../../../mock/mockSubject";
import "./CreateExam.css";

function CreateExam() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [questionBank, setQuestionBank] = useState([]);
  const [sourceType, setSourceType] = useState("bank");

  const [examInfo, setExamInfo] = useState({
      template_name: "",
      subject_id: null,
      duration: 45
    });

  const [filters, setFilters] = useState({
      search: "",
      difficulty: "all",
      type: "all"
    });

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects =
    async () => {
      try {
        const res =
          await getSubjects();
        setSubjects(
          res.data || []
        );
      } catch (err) {
        console.log(
          "API subject lỗi -> mock"
        );
        setSubjects(mockSubject);
      }
    };
  useEffect(() => {
    if (
      examInfo.subject_id
    ) {
      fetchQuestionBank(
        examInfo.subject_id
      );
    }
  }, [examInfo.subject_id]);

  const fetchQuestionBank =
    async (subjectId) => {
      setLoading(true);
      try {
        const res =
          await getQuestionBankBySubject(
            subjectId
          );
        setQuestionBank(
          res.data || []
        );
      } catch (err) {
        console.log(
          "API question lỗi -> mock"
        );
        setQuestionBank(
          mockQuestion[
            subjectId
          ] || []
        );
      } finally {
        setLoading(false);
      }
    };

  const filteredQuestions = questionBank.filter((q) => {
      const matchSearch = q.content.toLowerCase().includes(filters.search.toLowerCase());
      const matchDifficulty =
        filters.difficulty === "all"
          ? true
          : q.difficulty ===
            filters.difficulty;
      const matchType =
        filters.type === "all"
          ? true
          : q.type ===
            filters.type;
      return (
        matchSearch &&
        matchDifficulty &&
        matchType
      );
    });

  const handleSelectQuestion = (checked, question) => {
      if (checked) {
        setSelectedQuestions([
          ...selectedQuestions,
          {
            ...question,
            score: 1,
            order_index:
              selectedQuestions.length + 1
          }
        ]);
      } else {
        const updated = selectedQuestions.filter( (q) => q.question_id !== question.question_id)
            .map((q, index) => ({
              ...q,
              order_index:
                index + 1
            }));

        setSelectedQuestions(
          updated
        );
      }
    };

  const handleDeleteQuestion = (questionId) => {
      const updated =
        selectedQuestions
          .filter(
            (q) =>
              q.question_id !==
              questionId
          )
          .map((q, index) => ({
            ...q,
            order_index:
              index + 1
          }));

      setSelectedQuestions(
        updated
      );
    };
    const handleUploadFile = async (file) => {
      try {
        setLoading(true);
        const text = await file.text();
        const parsedQuestions = parseQuestionsFromText(text);
        setQuestionBank(parsedQuestions);
        message.success(
          "Đọc file thành công"
        );
      } catch (err) {
        console.log(err);
        message.error(
          "Không đọc được file"
        );
      } finally {
        setLoading(false);
      }
      return false;
    };
    const parseQuestionsFromText = (text) => {
      const blocks = text.split("\n\n");
      return blocks.map((block, index) => {
          const lines = block.split("\n");
          return {
            question_id:
              Date.now() + index,
            content:
              lines[0],
            difficulty:
              "Easy",
            type:
              "MCQ",
            answers: [
              {
                content:
                  lines[1],
                is_correct:
                  false
              },
              {
                content:
                  lines[2],
                is_correct:
                  true
              }
            ]
          };
        }
      );
    };

  const handleSaveExam =
    async () => {
      if (
        !examInfo.template_name.trim()
      ) {
        message.warning(
          "Nhập tên đề thi"
        );
        return;
      }
      if (
        !examInfo.subject_id
      ) {
        message.warning(
          "Chọn môn học"
        );
        return;
      }
      if (
        selectedQuestions.length === 0
      ) {
        message.warning(
          "Chọn ít nhất 1 câu hỏi"
        );
        return;
      }
      try {

        const payload = {

          template_name:
            examInfo.template_name,

          sub_id:
            examInfo.subject_id,

          template_config: {

            duration:
              examInfo.duration,

            total_question:
              selectedQuestions.length
          },

          questions:
            selectedQuestions.map(
              (q) => ({
                question_id:
                  q.question_id,

                score:
                  q.score,

                order_index:
                  q.order_index
              })
            )
        };

        await createExam(
          payload
        );

        message.success(
          "Tạo đề thi thành công"
        );

        navigate(
          "/teacher/examForMe"
        );

      } catch (err) {

        console.log(
          "API lỗi -> local"
        );

        const old =
          JSON.parse(
            localStorage.getItem(
              "my_exams"
            )
          ) || [];

        localStorage.setItem(
          "my_exams",

          JSON.stringify([
            ...old,
            {
              template_id:
                Date.now(),

              ...examInfo,

              questions:
                selectedQuestions
            }
          ])
        );

        message.success(
          "Đã lưu local"
        );

        navigate(
          "/teacher/examForMe"
        );
      }
    };

  const questionColumns = [

    {
      title: "",
      width: 60,

      render: (_, record) => (

        <Checkbox
          checked={
            selectedQuestions.some(
              (q) =>
                q.question_id ===
                record.question_id
            )
          }

          onChange={(e) =>
            handleSelectQuestion(
              e.target.checked,
              record
            )
          }
        />
      )
    },

    {
      title: "Nội dung",
      dataIndex: "content"
    },

    {
      title: "Độ khó",
      dataIndex: "difficulty",
      width: 120
    },

    {
      title: "Loại",
      dataIndex: "type",
      width: 120
    }
  ];

  const selectedColumns = [

    {
      title: "STT",
      dataIndex: "order_index",
      width: 70
    },

    {
      title: "Nội dung",
      dataIndex: "content"
    },

    {
      title: "Điểm",
      width: 120,

      render: (_, record) => (

        <InputNumber
          min={0}

          value={record.score}

          onChange={(value) => {

            const updated =
              selectedQuestions.map(
                (q) =>
                  q.question_id ===
                  record.question_id
                    ? {
                        ...q,
                        score: value
                      }
                    : q
              );

            setSelectedQuestions(
              updated
            );
          }}
        />
      )
    },

    {
      title: "",
      width: 80,

      render: (_, record) => (

        <DeleteOutlined
          className="delete-icon"

          onClick={() =>
            handleDeleteQuestion(
              record.question_id
            )
          }
        />
      )
    }
  ];

  return (

    <div className="create-exam-page">

      <div className="exam-top">

        <h1>
          Tạo đề thi
        </h1>

        <Button
          className="save-btn"
          onClick={handleSaveExam}
        >
          Lưu đề thi
        </Button>

      </div>

      <Card className="exam-info-card">

        <Row gutter={16}>

          <Col span={8}>

            <label>
              Tên đề thi
            </label>

            <Input
              placeholder="Nhập tên đề"

              value={
                examInfo.template_name
              }

              onChange={(e) =>
                setExamInfo({
                  ...examInfo,
                  template_name:
                    e.target.value
                })
              }
            />

          </Col>

          <Col span={8}>

            <label>
              Môn học
            </label>

            <Select
              style={{
                width: "100%"
              }}

              options={subjects.map(
                (s) => ({
                  value:
                    s.subject_id,

                  label:
                    s.subject_name
                })
              )}

              onChange={(value) => {

                setSelectedQuestions([]);

                setExamInfo({
                  ...examInfo,
                  subject_id:
                    value
                });
              }}
            />

          </Col>

          <Col span={8}>

            <label>
              Thời gian
            </label>

            <InputNumber
              min={1}

              style={{
                width: "100%"
              }}

              value={
                examInfo.duration
              }

              onChange={(value) =>
                setExamInfo({
                  ...examInfo,
                  duration:
                    value
                })
              }
            />

          </Col>

        </Row>

      </Card>

      <div className="source-box">

        <Button
          className={
            sourceType === "bank"
              ? "active-source"
              : ""
          }
          onClick={() =>
            setSourceType(
              "bank"
            )
          }
        >
          Ngân hàng câu hỏi
        </Button>

        <Button
          className={
            sourceType === "upload"
              ? "active-source"
              : ""
          }

          onClick={() =>
            setSourceType(
              "upload"
            )
          }
        >
          Upload PDF/Word
        </Button>

      </div>

      {sourceType ===
        "upload" && (

        <Card className="upload-card">

          <Upload
            beforeUpload={ handleUploadFile }
            showUploadList={true}
            accept=".txt,.pdf,.doc,.docx"
          >
            <Button
              icon={
                <UploadOutlined />
              }
            >
              Upload File
            </Button>
          </Upload>

        </Card>
      )}

      {sourceType ===
        "bank" && (

        <Row gutter={20}>

          <Col span={12}>

            <Card className="question-bank-card">

              <div className="filter-box">

                <Input
                  placeholder="Tìm nội dung..."

                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      search:
                        e.target.value
                    })
                  }
                />

                <Select
                  value={
                    filters.difficulty
                  }

                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      difficulty:
                        value
                    })
                  }

                  options={[
                    {
                      value: "all",
                      label: "Tất cả"
                    },
                    {
                      value: "Easy",
                      label: "Easy"
                    },
                    {
                      value: "Medium",
                      label: "Medium"
                    },
                    {
                      value: "Hard",
                      label: "Hard"
                    }
                  ]}
                />

              </div>

              {
                loading ? (
                  <Spin />
                ) : (
                  <Table
                    rowKey="question_id"

                    columns={
                      questionColumns
                    }

                    dataSource={
                      filteredQuestions
                    }

                    pagination={{
                      pageSize: 5
                    }}
                  />
                )
              }

            </Card>

          </Col>

          <Col span={12}>

            <Card className="selected-question-card">

              <h3>
                Câu hỏi đã chọn
              </h3>

              <Table
                rowKey="question_id"

                columns={
                  selectedColumns
                }

                dataSource={
                  selectedQuestions
                }

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
