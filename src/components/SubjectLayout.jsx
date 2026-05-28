import { Row, Col, Card, Empty, Spin, Tag, Button } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./SubjectLayout.css";

function SubjecLayout({
  subjects = [],
  loading,
  currentTab, // "bank" | "mine"
  children
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="subject-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!subjects || subjects.length === 0) {
    return <Empty description="Không có dữ liệu" />;
  }

  return (
    <div className="subject-container">
      <div className="subject-header">
        <Button
            className={
                currentTab === "bank"
                ? "tab-btn active-tab"
                : "tab-btn"
            }
            onClick={() => navigate("/teacher/questionBankSubject")}
            >
            Ngân hàng
        </Button>

        <Button
            className={
                currentTab === "mine"
                ? "tab-btn active-tab"
                : "tab-btn"
            }
            onClick={() => navigate("/teacher/questionForMe")}
            >
            Của tôi
        </Button>
        {children}
      </div>

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
              className="subject-card"
              onClick={() =>
                navigate(
                  currentTab === "mine"
                    ? `/teacher/my-question/${subject.subject_id}`
                    : `/teacher/question/${subject.subject_id}`
                )
              }
            >
              <div className="subject-icon">
                <BookOutlined />
              </div>

              <h2 className="subject-name">
                {subject.subject_name}
              </h2>

              <div className="question-total">
                📚 {subject.total_questions} câu hỏi
              </div>

              <div className="difficulty-wrapper">
                <Tag color="green">
                  Easy: {subject.easy_count}
                </Tag>

                <Tag color="orange">
                  Medium: {subject.medium_count}
                </Tag>

                <Tag color="red">
                  Hard: {subject.hard_count}
                </Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default SubjecLayout;