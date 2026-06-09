import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  DatePicker,
  InputNumber,
  Switch,
  Spin,
  message,
  Divider
} from "antd";

import { EditOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";

import {
  getSessionByIdService,
  updateSessionService
} from "../../../services/sessionService";

import {getClassMembersService} from "../../../services/classService";

import {getProctoringsService} from "../../../services/proctoringService";

import "./SessionDetail.css";

function SessionDetail() {
  const { sessionId } = useParams();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [proctorings, setProctorings] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [sessionId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      console.log("sessionId =", sessionId);
      console.log("typeof =", typeof sessionId);
      const numericSessionId = Number(sessionId);
      if (isNaN(numericSessionId)) {
        return message.error("Mã phiên thi không hợp lệ!");
      }

      const resDetail = await getSessionByIdService(numericSessionId);
      const sessionData = resDetail?.data || resDetail;

      setSession(sessionData);

      setEditData({
        ...sessionData,
        startTime: sessionData.startTime ? dayjs(sessionData.startTime) : null,
        endTime: sessionData.endTime ? dayjs(sessionData.endTime) : null
      });

      // ===== LẤY SINH VIÊN =====
      let allStudents = [];
      if (sessionData.classesInfo && sessionData.classesInfo.length) {
        for (const cls of sessionData.classesInfo) {
          const numericClassId = Number(cls.class_id);
          const members = await getClassMembersService({classId: numericClassId});
          allStudents.push(...(members.data || []));
        }
      }
      setStudents(allStudents);

      // ===== PROCTORING =====
      try {
        const logs = await getProctoringsService({
          sessionId: numericSessionId // Dùng ID dạng số
        });
        setProctorings(logs.data || []);
      } catch {
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
      // Loại bỏ các dữ liệu dư thừa không liên quan đến cấu trúc cập nhật nếu có
      const payload = {
        ...editData,
        startTime: editData.startTime?.toISOString() || null, 
        endTime: editData.endTime?.toISOString() || null
      };

      const updated = await updateSessionService(
        Number(sessionId), // Ép kiểu số cho ID khi cập nhật
        payload
      );

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

 const studentColumns = [
    {
      title: "Mã SV",
      dataIndex: "userId"
    },
    {
      title: "Họ tên",
      dataIndex: "fullName"
    }
  ];

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
        // Đổi màu sắc Tag dựa trên mức độ nghiêm trọng của hành vi
        let color = "blue";
        let text = event;
        
        if (event === "SWITCH_TAB" || event === "LEAVE_SCREEN") {
          color = "red";
          text = "Chuyển Tab / Rời màn hình";
        } else if (event === "DISCONNECT") {
          color = "orange";
          text = "Mất kết nối";
        } else if (event === "START_EXAM") {
          color = "green";
          text = "Bắt đầu làm bài";
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: "Thời gian",
      dataIndex: "eventTime",
      key: "eventTime",
      render: (time) => time ? dayjs(time).format("HH:mm:ss DD/MM/YYYY") : "---"
    },
    {
      title: "Dữ liệu chi tiết",
      dataIndex: "metadata",
      key: "metadata",
      align: "center",
      render: (metadata) => {
        if (!metadata) return <span style={{ color: "#bfbfbf" }}>Không có</span>;
        
        // Chuyển metadata thành chữ nếu BE trả về dạng Object, hoặc giữ nguyên nếu là String
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
            <p><b>Bắt đầu:</b> {session.startTime}</p>
            <p><b>Kết thúc:</b> {session.endTime}</p>

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

      {/* STUDENTS */}
      <Card title="Sinh viên tham gia" style={{ marginTop: 20 }}>
        <Table
          rowKey="userId"
          columns={studentColumns}
          dataSource={students}
        />
      </Card>

      {/* PROCTORING */}
      <Card title="Nhật ký giám sát" style={{ marginTop: 20 }}>
        <Table
          rowKey="id"
          columns={proctorColumns}
          dataSource={proctorings}
        />
      </Card>
    </div>
  );
}

export default SessionDetail;