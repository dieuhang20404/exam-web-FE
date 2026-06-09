import { Row, Col, Empty, Spin } from "antd";
import "./SubjectLayout.css";

function SubjectLayout({
  items = [],
  loading,
  emptyText = "Không có dữ liệu",
  renderCard,
  children
}) {
  return (
    <div className="subject-container">
      <div className="subject-header">
        {children}
      </div>
      {loading ? (
        <div className="subject-loading">
          <Spin size="large" />
        </div>
      ) : items && items.length > 0 ? (
        <Row gutter={[20, 20]}>
          {items.map((item) => (
            <Col
              xs={24}
              sm={12}
              md={8}
              lg={6}
              key={item.subject_id || item.subjectId || item.id}
            >
              {renderCard?.(item)}
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description={emptyText} />
      )}
    </div>
  );
}

export default SubjectLayout;