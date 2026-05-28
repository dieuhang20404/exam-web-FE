import { Row, Col, Card, Empty, Spin, Button } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ExamLayout.css";

function ExamLayout({
  subjects,
  loading,
  currentTab, // "bank" | "mine"
  children
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="exam-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <Empty description="Không có đề thi" />
    );
  }

  return (
    <div className="exam-container">

      {/* HEADER */}
      <div className="exam-header">

        <div className="exam-tabs">
          <Button
            className={
              currentTab === "bank"
                ? "tab-btn active-tab"
                : "tab-btn"
            }
            onClick={() =>
              `/teacher/exam/${subject.subject_id}`
            }
          >
            Ngân hàng
          </Button>

          <Button
            className={
              currentTab === "mine"
                ? "tab-btn active-tab"
                : "tab-btn"
            }
            onClick={() =>
              navigate("/teacher/examForMe")
            }
          >
            Của tôi
          </Button>
        </div>

        {children}
      </div>

      {/* CARD */}
      <Row gutter={[20, 20]}>
        {subjects.map((subject) => (
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={6}
            key={subject.subject_id}
          >
            <Card
              hoverable
              className="exam-card"
              onClick={() =>
                navigate(
                  currentTab === "mine"
                    ? `/teacher/my-exam/${subject.subject_id}`
                    : `/teacher/exam/${subject.subject_id}`
                )
              }
            >
              <div className="exam-icon">
                <FileTextOutlined />
              </div>

              <h2 className="exam-name">
                {subject.subject_name}
              </h2>

              <div className="exam-total">
                📄 {subject.total_exams} đề thi
              </div>

              <div className="card-footer">
                Nhấn để xem chi tiết →
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default ExamLayout;