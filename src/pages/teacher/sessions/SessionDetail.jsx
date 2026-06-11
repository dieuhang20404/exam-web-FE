import { Card, Table, Tag, Button, Input, DatePicker, InputNumber, Spin, message, Divider, Popover } from "antd";

import { 
  EditOutlined, 
  InfoCircleOutlined, 
  EyeOutlined 
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { getSessionByIdService, updateSessionService } from "../../../services/sessionService";

import { getProctoringsBySessionService } from "../../../services/proctoringService"; 
import { getSubmittedAttemptsBySessionService } from "../../../services/attemptService";

import "./SessionDetail.css";

function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [proctorings, setProctorings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const numericSessionId = Number(sessionId);
      if (isNaN(numericSessionId)) {
        return message.error("Mã phiên thi không hợp lệ!");
      }

      // 1. LẤY CHI TIẾT PHIÊN THI
      const resDetail = await getSessionByIdService(numericSessionId);
      const sessionData = resDetail?.data || resDetail;

      setSession(sessionData);

      setEditData({
        ...sessionData,
        startTime: sessionData.startTime ? dayjs(sessionData.startTime) : null,
        endTime: sessionData.endTime ? dayjs(sessionData.endTime) : null
      });

      // 2. LẤY DANH SÁCH BÀI THI ĐÃ NỘP
      try {
        const attemptsRes = await getSubmittedAttemptsBySessionService(numericSessionId, 1, 100);
        const attemptsList = attemptsRes?.data || attemptsRes || [];
        setAttempts(attemptsList);
      } catch (err) {
        console.error("Lỗi lấy danh sách bài nộp:", err);
        setAttempts([]);
      }

      // 3. LẤY NHẬT KÝ GIÁM SÁT (PROCTORING LOGS)
      try {
        const proctorRes = await getProctoringsBySessionService(numericSessionId, 1, 50); 
        const proctorList = proctorRes?.data || proctorRes || [];
        setProctorings(proctorList);
      } catch (err) {
        console.error("Lỗi lấy nhật ký giám sát:", err);
        setProctorings([]);
      }

    } catch (err) {
      console.error(err);
      message.error("Không tải được phiên thi");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...editData,
        startTime: editData.startTime?.toISOString() || null, 
        endTime: editData.endTime?.toISOString() || null
      };

      const updated = await updateSessionService(Number(sessionId), payload);
      const newSessionData = updated?.data || updated;
      setSession(newSessionData);
      setEditMode(false);
      message.success("Cập nhật thành công");
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại");
    }
  };

  // ===== ĐỊNH NGHĨA CỘT BẢNG BÀI THI ĐÃ NỘP =====
  const attemptColumns = [
    {
      title: "Mã SV",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "Lượt thi",
      dataIndex: "attemptNo",
      key: "attemptNo",
      render: (no, record) => (
        <span>
          Lần {no} {record.isRetake && <Tag color="warning">Thi lại</Tag>}
        </span>
      )
    },
    {
      title: "Thời gian nộp",
      dataIndex: "submitTime",
      key: "submitTime",
      render: (time) => time ? (
        <span style={{ fontWeight: "500" }}>
          {dayjs(time).format("HH:mm")} <span style={{ color: "#8c8c8c", fontSize: "12px" }}>({dayjs(time).format("DD/MM/YYYY")})</span>
        </span>
      ) : "---"
    },
    {
      title: "Điểm số",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (score) => score !== undefined && score !== null ? (
        <b style={{ color: "#52c41a", fontSize: "16px" }}>{score}</b>
      ) : (
        <span style={{ color: "#bfbfbf" }}>Chưa chấm</span>
      )
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => navigate(`/attempts/${record.attemptId}`)}
        >
          Xem chi tiết
        </Button>
      )
    }
  ];

  // ===== ĐỊNH NGHĨA CỘT BẢNG NHẬT KÝ GIÁM SÁT =====
  const proctorColumns = [
    {
      title: "Sinh viên",
      dataIndex: "studentName",
      key: "studentName",
      render: (text, record) => (
        <div>
          <span style={{ fontWeight: "bold" }}>{text || "Chưa rõ tên"}</span>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            Lượt thi ID: #{record.attempId}
          </div>
        </div>
      )
    },
    {
      title: "Hành vi / Sự kiện",
      dataIndex: "eventType",
      key: "eventType",
      render: (event) => {
        let color = "blue";
        let text = event;
        
        switch (event) {
          case "SWITCH_TAB":
          case "TAB_SWITCH":
            color = "red";
            text = "Chuyển Tab / Rời màn hình";
            break;
          case "FULLSCREEN_EXIT":
          case "LEAVE_SCREEN":
            color = "volcano";
            text = "Thoát toàn màn hình";
            break;
          case "COPY_PASTE":
            color = "magenta";
            text = "Sao chép / Dán dữ liệu";
            break;
          case "DISCONNECT":
            color = "orange";
            text = "Mất kết nối";
            break;
          case "START_EXAM":
          case "ENTER_EXAM":
            color = "green";
            text = "Bắt đầu làm bài";
            break;
          default:
            color = "blue";
            text = event;
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: "Thời gian",
      dataIndex: "eventTime",
      key: "eventTime",
      render: (time) => time ? (
        <span style={{ fontWeight: "500" }}>
          {dayjs(time).format("HH:mm")} <span style={{ color: "#8c8c8c", fontSize: "12px" }}>({dayjs(time).format("DD/MM/YYYY")})</span>
        </span>
      ) : "---"
    },
    {
      title: "Dữ liệu chi tiết",
      dataIndex: "metadata",
      key: "metadata",
      align: "center",
      render: (metadata) => {
        if (!metadata) return <span style={{ color: "#bfbfbf" }}>Không có</span>;
        
        const contentString = typeof metadata === "object" 
          ? JSON.stringify(metadata, null, 2) 
          : metadata;

        return (
          <Popover
            content={
              <pre style={{ maxHeight: "200px", overflowY: "auto", margin: 0, fontSize: "12px" }}>
                {contentString}
              </pre>
            }
            title="Thông số kỹ thuật"
            trigger="click"
          >
            <Button type="text" icon={<InfoCircleOutlined />} size="small">
              Chi tiết
            </Button>
          </Popover>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" tip="Đang tải dữ liệu phiên thi..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p>Không tìm thấy dữ liệu phiên thi.</p>
      </div>
    );
  }

  return (
    <div className="session-detail-page">
      {/* SESSION INFO */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h2>{session.sessionName}</h2>
          {!editMode && (
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={() => setEditMode(true)}
            >
              Chỉnh sửa nhanh
            </Button>
          )}
        </div>

        {!editMode ? (
          <>
            <p><b>Template ID:</b> {session.templateId}</p>
            <p><b>Thời lượng:</b> {session.duration} phút</p>
          
            <p><b>Bắt đầu:</b> {session.startTime ? dayjs(session.startTime).format("HH:mm DD/MM/YYYY") : "---"}</p>
            <p><b>Kết thúc:</b> {session.endTime ? dayjs(session.endTime).format("HH:mm DD/MM/YYYY") : "---"}</p>

            <Divider />

            <p>Shuffle Questions: {session.shuffleQuestions ? "Có" : "Không"}</p>
            <p>Shuffle Answers: {session.shuffleAnswers ? "Có" : "Không"}</p>
            <p>Auto Submit: {session.autoSubmit ? "Có" : "Không"}</p>
            <p>Allow Review: {session.allowReview ? "Có" : "Không"}</p>
            <p>Show Result: {session.showResult ? "Có" : "Không"}</p>
            <p>Attempt Limit: {session.attemptLimit}</p>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: 400 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4 }}>Tên kỳ thi:</label>
              <Input
                value={editData.sessionName}
                onChange={(e) => setEditData({ ...editData, sessionName: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 4 }}>Thời gian mở đề:</label>
              <DatePicker
                showTime
                style={{ width: "100%" }}
                value={editData.startTime}
                onChange={(v) => setEditData({ ...editData, startTime: v })}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 4 }}>Thời gian đóng đề:</label>
              <DatePicker
                showTime
                style={{ width: "100%" }}
                value={editData.endTime}
                onChange={(v) => setEditData({ ...editData, endTime: v })}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 4 }}>Thời lượng (phút):</label>
              <InputNumber
                style={{ width: "100%" }}
                value={editData.duration}
                onChange={(v) => setEditData({ ...editData, duration: v })}
              />
            </div>

            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <Button onClick={() => setEditMode(false)}>Hủy</Button>
              <Button type="primary" onClick={handleSave}>Lưu</Button>
            </div>
          </div>
        )}
      </Card>

      {/* CLASSES */}
      <Card title="Lớp tham gia" style={{ marginTop: 20 }}>
        {session.classesInfo?.map((cls) => (
          <Tag key={cls.class_id} color="green">
            {cls.class_name} 
          </Tag>
        ))}
      </Card>

      {/* BẢNG 1: BÀI THI ĐÃ NỘP */}
      <Card title="Bài thi đã nộp" style={{ marginTop: 20 }}>
        <Table
          rowKey="attemptId"
          columns={attemptColumns}
          dataSource={attempts}
        />
      </Card>

      {/* BẢNG 2: NHẬT KÝ GIÁM SÁT */}
      <Card title="Nhật ký giám sát" style={{ marginTop: 20 }}>
        <Table
          rowKey="eventId"
          columns={proctorColumns}
          dataSource={proctorings}
        />
      </Card>
    </div>
  );
}

export default SessionDetail;