import { useEffect, useState } from "react";
import { Table, Card, Spin, Button, Tag, Space, Popconfirm, Tooltip, message} from "antd";
import { useNavigate } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "./SessionList.css";

import { getSessionsService, deleteSessionService } from "../../../services/sessionService";
import CreateExamSession from "../../../components/CreateExamSession";

function SessionList() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const templates = [
    { templateId: 1, templateName: "Java Midterm" },
    { templateId: 2, templateName: "React Quiz" }
  ];

  const [formData, setFormData] = useState({
    templateId: null,
    sessionName: "",
    duration: 60,
    shuffleQuestions: false,
    shuffleAnswers: false,
    autoSubmit: true,
    allowReview: false,
    showResult: false,
    startTime: null,
    endTime: null,
    attemptLimit: 1,
    sessionPassword: ""
  });

  const loadSessions = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await getSessionsService({ page, limit });
      
      const sessionData = res?.data || [];
      const pageInfo = res?.pagination || {};

      setSessions(sessionData);
      setPagination({
        current: Number(pageInfo.page) || page,
        pageSize: Number(pageInfo.limit) || limit,
        total: Number(pageInfo.total) || 0
      });

    } catch (err) {
      message.error("Không tải được danh sách kỳ thi từ hệ thống!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation(); 
    try { 
      await deleteSessionService(sessionId);
      message.success(`Xóa kỳ thi ID ${sessionId} thành công!`);
      loadSessions(pagination.current, pagination.pageSize); 
    } catch (err) {
      message.error("Xóa kỳ thi thất bại!");
      console.error(err);
    }
  };

  const handleEdit = (sessionId, e) => {
    e.stopPropagation(); 
    navigate(`/teacher/sessionEdit/${sessionId}`); 
  };

  const handleCreateExam = async () => {
    try {
      if (!formData.sessionName.trim()) {
        return message.warning("Vui lòng nhập tên kỳ thi!");
      }
      if (!formData.templateId) {
        return message.warning("Vui lòng chọn đề thi mẫu!");
      }

      message.success("Tạo kỳ thi thành công!");
      setOpenModal(false);
      loadSessions();

      setFormData({
        templateId: null,
        sessionName: "",
        duration: 60,
        shuffleQuestions: false,
        shuffleAnswers: false,
        autoSubmit: true,
        allowReview: false,
        showResult: false,
        startTime: null,
        endTime: null,
        attemptLimit: 1,
        sessionPassword: ""
      });

    } catch (err) {
      message.error("Tạo kỳ thi thất bại!");
      console.error(err);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "sessionId",
      width: 80,
      align: "center"
    },
    {
      title: "Tên kỳ thi",
      dataIndex: "sessionName",
    },
    {
     title: "Hành động",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Sửa đề thi">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#b58900" }} />} 
              onClick={() => {
                console.log("Dữ liệu đề cần sửa:", record);
                navigate(`/teacher/sessionEdit/${record.sessionId}`);
              }}
            />
          </Tooltip>

          <Tooltip title="Xóa đề thi">
            <Popconfirm
              title="Xóa mẫu đề thi"
              description="Bạn có chắc chắn muốn xóa mẫu đề thi này không?"
              onConfirm={() => {
                console.log("ID đề cần xóa:", record.sessionId);
                handleDelete(record.sessionId, event);
              }}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    },
     {
       title:
        "Chi tiết",
      render:
        (_, record) => (
          <Button
            type="link"
            onClick={() =>
              navigate(
                `/teacher/sessionDetail/${record.sessionId}`
              )
            }
          >
            Xem
          </Button>
        )
    },
  ];

  return (
    <div className="session-list-page" style={{ padding: "24px" }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Quản lý các kỳ thi</h2>
        <Button
          type="primary"
          style={{ background: "#b58900", borderColor: "#b58900" }}
          onClick={() => navigate("/teacher/createSession")}
        >
          + Tạo kỳ thi mới
        </Button>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" tip="Đang tải danh sách kì thi..." />
          </div>
        ) : (
          <Table
            rowKey="sessionId"
            columns={columns}
            dataSource={sessions}
            locale={{
              emptyText: "Hệ thống chưa ghi nhận kỳ thi nào"
            }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              onChange: (page, pageSize) => {
                loadSessions(page, pageSize);
              }
            }}
          />
        )}
      </Card>

      <CreateExamSession
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleCreateExam}
        formData={formData}
        setFormData={setFormData}
        templates={templates}
      />
    </div>
  );
}

export default SessionList;