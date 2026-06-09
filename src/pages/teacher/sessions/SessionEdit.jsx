import { useState, useEffect } from "react";
import { Card, Input, Select, DatePicker, InputNumber, Switch, Button, message, Spin } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./CreateSession.css";

import { FileTextOutlined, CalendarOutlined, SettingOutlined, LockOutlined, ArrowLeftOutlined } from "@ant-design/icons";

import { getSessionByIdService, updateSessionService } from "../../../services/sessionService";
import { getSubjectsService } from "../../../services/subjectService";
import { getTemplatesService } from "../../../services/templateService";
import { getMyClassesService } from "../../../services/classService";

function EditSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);

  const [formData, setFormData] = useState({
    subjectId: null,
    templateId: null,
    sessionName: "",
    classIds: [],
    duration: null,
    attemptLimit: 1,
    sessionPassword: "",
    shuffleQuestions: false,
    shuffleAnswers: false,
    autoSubmit: true,
    allowReview: false,
    showResult: false,
    startTime: null,
    endTime: null
  });

  useEffect(() => {
    const initData = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        const [resSubjects, resClasses] = await Promise.all([
          getSubjectsService(),
          getMyClassesService()
        ]);
        
        const allSubjects = resSubjects.data || [];
        const allClasses = resClasses.data || [];
        
        setSubjects(allSubjects);
        setClasses(allClasses);
        const resDetail = await getSessionByIdService(Number(sessionId));
        const data = resDetail?.data || resDetail;

        if (data) {
    
          const rawClassIds = data.classIds || data.classesInfo?.map(c => c.classId) || [];
          const numericClassIds = rawClassIds.map(id => Number(id));
          if (data.subjectId) {
            const resTemplates = await getTemplatesService({ subjectId: Number(data.subjectId) });
            const allTemplates = Array.isArray(resTemplates) ? resTemplates : (resTemplates?.data || []);
            setTemplates(allTemplates);
          }

          setFormData({
            subjectId: data.subjectId ? Number(data.subjectId) : null,
            templateId: data.templateId ? Number(data.templateId) : null,
            sessionName: data.sessionName || "",
            classIds: numericClassIds,
            duration: data.duration || null,
            attemptLimit: data.attemptLimit || 1,
            sessionPassword: data.sessionPassword || "",
            shuffleQuestions: !!data.shuffleQuestions,
            shuffleAnswers: !!data.shuffleAnswers,
            autoSubmit: data.autoSubmit !== false,
            allowReview: !!data.allowReview,
            showResult: !!data.showResult,
            startTime: data.startTime ? dayjs(data.startTime) : null,
            endTime: data.endTime ? dayjs(data.endTime) : null
          });
        }
      } catch (err) {
        console.error("Lỗi khi map tên dữ liệu:", err);
        message.error("Lỗi tải dữ liệu hiển thị!");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [sessionId]);

  const handleUpdate = async () => {
    try {
      if (!formData.sessionName.trim()) return message.warning("Vui lòng nhập tên kỳ thi!");
      if (!formData.duration) return message.warning("Vui lòng nhập thời lượng thi!");

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
        startTime: formData.startTime ? formData.startTime.toISOString() : null,
        endTime: formData.endTime ? formData.endTime.toISOString() : null,
        classIds: formData.classIds.map((id) => Number(id)),
        sessionStatus: "published"
      };

      await updateSessionService(Number(sessionId), payload);
      message.success("Cập nhật kỳ thi thành công!");
      navigate("/teacher/sessionList");
    } catch (err) {
      message.error("Cập nhật kỳ thi thất bại!");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang đọc thông tin kỳ thi..." />
      </div>
    );
  }

  return (
    <div className="create-session-page">
      <div className="page-header">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/teacher/sessionList")}>
          Quay lại
        </Button>
        <h1>CHỈNH SỬA KỲ THI</h1>
      </div>

      {/* ================= INFO ================= */}
        <Card className="form-card">
        <h3><FileTextOutlined /> Thông tin kỳ thi</h3>

        <label>Tên kỳ thi</label>
        <Input
            placeholder="Nhập tên kỳ thi"
            value={formData.sessionName}
            onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
        />

        <label>Môn học (Cố định)</label>
        <Select
            disabled
            style={{ width: "100%" }}
            value={formData.subjectId} 
            options={subjects.map((s) => ({
            value: Number(s.subjectId), 
            label: s.subjectName        
            }))}
        />
        <label>Đề thi mẫu (Cố định)</label>
        <Select
            disabled
            style={{ width: "100%" }}
            value={formData.templateId} 
            options={templates.map((t) => ({
            value: Number(t.templateId), 
            label: t.templateName       
            }))}
        />
        <label>Lớp áp dụng (Cố định)</label>
        <Select
            disabled
            mode="multiple"
            style={{ width: "100%" }}
            value={formData.classIds} 
            options={classes.map((c) => ({
            value: Number(c.classId),   
            label: c.className         
            }))}
        />
        </Card>
      <Card className="form-card">
        <h3><CalendarOutlined /> Thời gian & Giới hạn</h3>

        <label>Thời gian bắt đầu mở đề</label>
        <DatePicker
          showTime
          style={{ width: "100%" }}
          value={formData.startTime}
          onChange={(date) => setFormData({ ...formData, startTime: date })}
        />

        <label>Thời gian đóng đề (Hết hạn thi)</label>
        <DatePicker
          showTime
          style={{ width: "100%" }}
          value={formData.endTime}
          onChange={(date) => setFormData({ ...formData, endTime: date })}
        />

        <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Thời lượng (phút)</label>
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              value={formData.duration}
              onChange={(value) => setFormData({ ...formData, duration: value })}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Số lần thi tối đa</label>
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              value={formData.attemptLimit}
              onChange={(value) => setFormData({ ...formData, attemptLimit: value })}
            />
          </div>
        </div>

        <label style={{ display: "block", marginTop: "12px" }}>Mật khẩu phòng thi (Nếu có)</label>
        <Input.Password
          placeholder="Bỏ trống nếu không cần mật khẩu"
          prefix={<LockOutlined />}
          value={formData.sessionPassword}
          onChange={(e) => setFormData({ ...formData, sessionPassword: e.target.value })}
        />
      </Card>

      {/* ================= CONFIG ================= */}
      <Card className="form-card">
        <h3><SettingOutlined /> Cấu hình nâng cao</h3>
        <SwitchRow
          label="Trộn thứ tự câu hỏi"
          checked={formData.shuffleQuestions}
          onChange={(v) => setFormData({ ...formData, shuffleQuestions: v })}
        />
        <SwitchRow
          label="Trộn thứ tự đáp án lựa chọn"
          checked={formData.shuffleAnswers}
          onChange={(v) => setFormData({ ...formData, shuffleAnswers: v })}
        />
        <SwitchRow
          label="Tự động nộp bài khi hết giờ (Auto Submit)"
          checked={formData.autoSubmit}
          onChange={(v) => setFormData({ ...formData, autoSubmit: v })}
        />
        <SwitchRow
          label="Cho phép xem lại bài làm sau khi nộp"
          checked={formData.allowReview}
          onChange={(v) => setFormData({ ...formData, allowReview: v })}
        />
        <SwitchRow
          label="Hiển thị kết quả điểm số lập tức"
          checked={formData.showResult}
          onChange={(v) => setFormData({ ...formData, showResult: v })}
        />
      </Card>

      {/* ================= ACTION ================= */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
        <Button onClick={() => navigate("/teacher/sessionList")}>Hủy bỏ</Button>
        <Button 
          type="primary" 
          style={{ background: "#ff8827", borderColor: "#ff8827" }} 
          onClick={handleUpdate}
        >
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}

function SwitchRow({ label, checked, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
      <span>{label}</span>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

export default EditSession;