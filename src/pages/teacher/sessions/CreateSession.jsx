import { useState, useEffect } from "react";
import { Card, Input, Select, DatePicker, InputNumber, Switch, Button, message } from "antd";

import dayjs from "dayjs";
import "./CreateSession.css";

import { FileTextOutlined, CalendarOutlined, SettingOutlined, LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { createSessionService } from "../../../services/sessionService";
import { getSubjectsService } from "../../../services/subjectService";
import { getTemplatesService } from "../../../services/templateService";
import { getMyClassesService } from "../../../services/classService";

function CreateSession() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subjectId: null,
    templateId: null,
    sessionName: "",
    classIds: [], // Dùng lưu tạm danh sách ID để tương tác với thẻ Select antd

    duration: null,
    attemptLimit: 1,
    sessionPassword: "",

    shuffleQuestions: false,
    shuffleAnswers: false,
    autoSubmit: true,
    allowReview: false,
    showResult: false, // Bổ sung trường này vào State vì BE có yêu cầu xử lý

    startTime: null,
    endTime: null
  });

  const [subjects, setSubjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user.userId || user.id;
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await getSubjectsService();
        setSubjects(res.data || []);
      } catch {
        message.error("Không tải được danh sách môn học");
      }
    };

    fetchSubjects();
  }, []);

  const fetchTemplatesBySubject = async (subjectId) => {
    if (!subjectId) return; 
    
    try {
      const query = {
        subjectId: Number(subjectId) 
      };
      const res = await getTemplatesService(query); 
      const templateList = Array.isArray(res) ? res : (res?.data || []);
      setTemplates(templateList);
    } catch (err) {
      console.error("Lỗi thực tế từ Backend:", err); 
      message.error("Không tải được danh sách đề thi mẫu");
    }
  };
  const fetchClassesBySubject = async () => {
    try {
      const res = await getMyClassesService();
      setClasses(res.data || []);
    } catch {
      message.error("Không tải được danh sách lớp học");
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.sessionName.trim()) {
        return message.warning("Vui lòng nhập tên kỳ thi!");
      }

      if (!formData.templateId) {
        return message.warning("Vui lòng chọn đề thi!");
      }

      if (formData.classIds.length === 0) {
        return message.warning("Vui lòng chọn lớp thi!");
      }

      if (!formData.duration) {
        return message.warning("Vui lòng nhập thời lượng thi!");
      }

      const payload = {
        templateId: Number(formData.templateId),
        sessionName: formData.sessionName.trim(),
        duration: Number(formData.duration),
        attemptLimit: Number(formData.attemptLimit),
        sessionPassword: formData.sessionPassword || null,
        
        shuffleQuestions: formData.shuffleQuestions,
        shuffleAnswers: formData.shuffleAnswers,
        autoSubmit: formData.autoSubmit,
        allowReview: formData.allowReview,
        showResult: formData.showResult,

        startTime: formData.startTime ? dayjs(formData.startTime).toISOString() : null,
        endTime: formData.endTime ? dayjs(formData.endTime).toISOString() : null,
        classIds: formData.classIds.map((id) => Number(id)),
        sessionStatus: "published" 
      };

      console.log("Payload chuẩn bị bắn lên Backend:", payload);

      await createSessionService(payload);
      message.success("Tạo kỳ thi thành công!");
      navigate("/teacher/sessionList");

    } catch (err) {
      message.error("Tạo kỳ thi thất bại!");
      console.error(err);
    }
  };

  return (
    <div className="create-session-page">
      {/* HEADER */}
      <div className="page-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/teacher/sessionList")}
        >
          Quay lại
        </Button>
        <h1>TẠO KỲ THI MỚI</h1>
      </div>

      {/* ================= INFO ================= */}
      <Card className="form-card">
        <h3><FileTextOutlined /> Thông tin kỳ thi</h3>

        <label>Tên kỳ thi</label>
        <Input
          placeholder="Nhập tên kỳ thi (Ví dụ: Thi giữa kỳ môn Java)"
          value={formData.sessionName}
          onChange={(e) =>
            setFormData({ ...formData, sessionName: e.target.value })
          }
        />

        <label>Môn học</label>
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn môn học"
          value={formData.subjectId}
          options={subjects.map((s) => ({
            value: s.subjectId,
            label: s.subjectName
          }))}
          onChange={(value) => {
            setFormData({
              ...formData,
              subjectId: value,
              templateId: null,
              classIds: []
            });

            fetchTemplatesBySubject(value);
            fetchClassesBySubject(value);
          }}
        />

        <label>Đề thi</label>
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn đề thi mẫu cho kỳ thi"
          disabled={!formData.subjectId}
          value={formData.templateId}
          options={templates.map((t) => ({
            value: t.templateId,
            label: t.templateName
          }))}
          onChange={(value) =>
            setFormData({ ...formData, templateId: value })
          }
        />

        <label>Lớp áp dụng</label>
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="Chọn một hoặc nhiều lớp tham gia thi"
          disabled={!formData.subjectId}
          value={formData.classIds}
          options={classes.map((c) => ({
            value: c.classId,
            label: c.className
          }))}
          onChange={(value) =>
            setFormData({ ...formData, classIds: value })
          }
        />
      </Card>

      {/* ================= TIME ================= */}
      <Card className="form-card">
        <h3><CalendarOutlined /> Thời gian & Giới hạn</h3>

        <label>Thời gian bắt đầu mở đề</label>
        <DatePicker
          showTime
          style={{ width: "100%" }}
          value={formData.startTime}
          onChange={(date) =>
            setFormData({ ...formData, startTime: date })
          }
        />

        <label>Thời gian đóng đề (Hết hạn thi)</label>
        <DatePicker
          showTime
          style={{ width: "100%" }}
          value={formData.endTime}
          onChange={(date) =>
            setFormData({ ...formData, endTime: date })
          }
        />

        <div className="grid-2" style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Thời lượng (phút)</label>
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Ví dụ: 60"
              value={formData.duration}
              onChange={(value) =>
                setFormData({ ...formData, duration: value })
              }
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Số lần thi tối đa</label>
            <InputNumber
              style={{ width: "100%" }}
              value={formData.attemptLimit}
              min={1}
              onChange={(value) =>
                setFormData({ ...formData, attemptLimit: value })
              }
            />
          </div>
        </div>

        <label style={{ display: "block", marginTop: "12px" }}>Mật khẩu phòng thi (Nếu có)</label>
        <Input.Password
          placeholder="Bỏ trống nếu không cần bảo mật phòng thi"
          prefix={<LockOutlined />}
          value={formData.sessionPassword}
          onChange={(e) =>
            setFormData({ ...formData, sessionPassword: e.target.value })
          }
        />
      </Card>

      {/* ================= CONFIG ================= */}
      <Card className="form-card">
        <h3><SettingOutlined /> Cấu hình nâng cao</h3>

        <SwitchRow
          label="Trộn thứ tự câu hỏi"
          checked={formData.shuffleQuestions}
          onChange={(v) =>
            setFormData({ ...formData, shuffleQuestions: v })
          }
        />

        <SwitchRow
          label="Trộn thứ tự đáp án lựa chọn"
          checked={formData.shuffleAnswers}
          onChange={(v) =>
            setFormData({ ...formData, shuffleAnswers: v })
          }
        />

        <SwitchRow
          label="Tự động nộp bài khi hết giờ (Auto Submit)"
          checked={formData.autoSubmit}
          onChange={(v) =>
            setFormData({ ...formData, autoSubmit: v })
          }
        />

        <SwitchRow
          label="Cho phép xem lại bài làm sau khi nộp"
          checked={formData.allowReview}
          onChange={(v) =>
            setFormData({ ...formData, allowReview: v })
          }
        />

        <SwitchRow
          label="Hiển thị kết quả điểm số lập tức"
          checked={formData.showResult}
          onChange={(v) =>
            setFormData({ ...formData, showResult: v })
          }
        />
      </Card>

      {/* ================= ACTION ================= */}
      <div className="submit-row" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
        <Button onClick={() => navigate("/teacher/sessionList")}>
          Hủy bỏ
        </Button>
        <Button 
          type="primary" 
          style={{ background: "#ff8827", borderColor: "#ff8827" }} 
          onClick={handleCreate}
        >
          Tạo kỳ thi ngay
        </Button>
      </div>
    </div>
  );
}

function SwitchRow({ label, checked, onChange }) {
  return (
    <div className="switch-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
      <span>{label}</span>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

export default CreateSession;