import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Card, Button, Tag, Spin } from "antd";
import { mockExam } from "../../../mock/examDetailMock";
import { getExamDetail } from "../../../api/api";
import "./ExamDetail.css";

function ExamDetail() {
  
  const { subjectId, examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [exam, setExam] = useState(null);

  useEffect(() => { fetchExam(); }, [examId]);

  const fetchExam = async () => {
    try {
        const res = await getExamDetail(examId);

        setExam(res.data);
    } catch (err) {
        console.log("API lỗi -> dùng mock");

        const data =
        mockExam[Number(subjectId)]
            ?.find(
            (e) =>
                e.exam_id === Number(examId)
            );

        setExam(data);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="exam-loading">
        <Spin
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="exam-detail-page">

      {/* header */}
      <Button
        className="bt-back"
        onClick={() =>
          navigate(-1)
        }
      >
        ← Quay lại
      </Button>

      {/* info */}
      <Card className="exam-info-card">
        <h1>
          {exam.title}
        </h1>

        <p>
          Môn học:
          {" "}
          {
            exam.subject_name
          }
        </p>

        <p>
          Thời gian:
          {" "}
          {
            exam.duration
          }
          {" "}
          phút
        </p>

        <p>
          Số câu:
          {" "}
          {
            exam.total_questions
          }
        </p>
      </Card>

      {/* questions */}
      {exam.questions.map(
        (
          question,
          qIndex
        ) => (
          <Card
            key={
              question.question_id
            }
            className="question-card"
          >
            <div className="question-top">
              <h3>
                Câu
                {" "}
                {
                  qIndex +
                  1
                }
              </h3>

              <Tag>
                {
                  question.difficulty
                }
              </Tag>
            </div>

            <p className="question-content">
              {
                question.content
              }
            </p>

            <div className="answer-list">
              {question.answers.map(
                (
                  ans,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className={
                      ans.is_correct
                        ? "correct-answer"
                        : "answer-item"
                    }
                  >
                    {
                      String.fromCharCode(
                        65 +
                          index
                      )
                    }
                    .
                    {" "}
                    {
                      ans.content
                    }
                  </div>
                )
              )}
            </div>
          </Card>
        )
      )}
    </div>
  );
}

export default ExamDetail;