import { useState, useEffect  } from "react";
import {
  Card,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Button,
  Divider,
  message
} from "antd";
import "./CreateSession.css";
import {
  FileTextOutlined,
  CalendarOutlined,
  SettingOutlined,
  LockOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";


function CreateSession() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      subject_id: null,
      template_id: null,
      session_name: "",
      class_ids: [],
      duration: null,

      shuffle_questions: false,
      shuffle_answers: false,
      auto_submit: true,
      allow_review: false,
      show_result: false,

      start_time: null,
      end_time: null,

      attempt_limit: 1,
      session_password: ""
    });

    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
      fetchSubjects();
    }, []);

    const fetchSubjects =
      async () => {
        try {
          const res =
            await getSubjects();

          setSubjects(
            res.data
          );

        } catch (err) {
          message.error(
            "Không tải được môn học"
          );
        }
      };

  const [templates, setTemplates] = useState([]);

  const fetchTemplatesBySubject =
    async (subjectId) => {
      try {
        const res =
          await getExamTemplates(
            subjectId
          );

        setTemplates(
          res.data
        );

      } catch (err) {
        message.error(
          "Không tải được đề thi"
        );
      }
    };

    const [ classes, setClasses ] = useState([]);
    const fetchClassesBySubject =
      async (subjectId) => {
        try {
          const res =
            await getClassesBySubject(
              subjectId
            );

          setClasses(
            res.data
          );

        } catch {
          message.error(
            "Không tải được lớp"
          );
        }
      };

      const [
        loadingTemplates,
        setLoadingTemplates
      ] = useState(false);
  
  const handleCreate = () => {
    if (!formData.session_name.trim()) {
      message.warning(
        "Nhập tên kỳ thi"
      );
      return;
    }

    if (!formData.template_id) {
      message.warning(
        "Chọn đề thi"
      );
      return;
    }

    if (
      formData.class_ids.length === 0
    ) {
      message.warning(
        "Chọn lớp thi"
      );
      return;
    }

    console.log(formData);

    message.success(
      "Tạo kỳ thi thành công"
    );

    navigate(
      "/teacher/sessionList"
    );
  };

  return (
    <div className="create-session-page">

      <div className="page-header">
        <Button
          className="bt-back"
          icon={
            <ArrowLeftOutlined />
          }
          onClick={() =>
            navigate(
              "/teacher/sessionList"
            )
          }
        >
          Quay lại
        </Button>

        <h1>
          TẠO KỲ THI MỚI
        </h1>
      </div>

      {/* CARD 1 */}
      <Card className="form-card">
        <h3>
          <FileTextOutlined />
          Thông tin kỳ thi
        </h3>

        <label>
          Tên kỳ thi
        </label>
        <Input
          placeholder="VD: Java Midterm"
          value={
            formData.session_name
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              session_name:
                e.target.value
            })
          }
        />

        <label>Chọn môn học</label>
        <Select
          placeholder="Chọn môn"
          value={formData.subject_id}
          onChange={(value) => {
            setFormData({
              ...formData,
              subject_id: value,
              template_id: null,
              class_ids: []
            });

            fetchTemplatesBySubject(value);
            fetchClassesBySubject(value);
          }}
          options={subjects.map((s) => ({
            value: s.subject_id,
            label: s.subject_name
          }))}
        />
        <label>
          Chọn đề thi
        </label>
        <Select
          placeholder="Chọn đề"
          value={
            formData.template_id
          }
          onChange={(value) =>
            setFormData({
              ...formData,
              template_id:
                value
            })
          }
          options={templates.map(
            (t) => ({
              value:
                t.template_id,
              label:
                t.template_name
            })
          )}
        />

        <label>
          Chọn lớp áp dụng
        </label>

        <Select
          mode="multiple"
          placeholder="Chọn lớp"
          value={formData.class_ids}
          onChange={(value) =>
            setFormData({
              ...formData,
              class_ids: value
            })
          }
          options={classes.map((c) => ({
            value: c.class_id,
            label: c.class_name
          }))}
        />
      </Card>

      {/* CARD 2 */}
      <Card className="form-card">
        <h3>
          <CalendarOutlined />
          Thời gian
        </h3>

        <label>
          Bắt đầu
        </label>
        <DatePicker
          showTime
          style={{
            width: "100%"
          }}
          value={
            formData.start_time
          }
          onChange={(date) =>
            setFormData({
              ...formData,
              start_time:
                date
            })
          }
        />

        <label>
          Kết thúc
        </label>
        <DatePicker
          showTime
          style={{
            width: "100%"
          }}
          value={
            formData.end_time
          }
          onChange={(date) =>
            setFormData({
              ...formData,
              end_time:
                date
            })
          }
        />

        <div className="grid-2">
          <div>
            <label>
              Thời lượng
            </label>
            <InputNumber
              style={{
                width: "100%"
              }}
              min={1}
              value={
                formData.duration
              }
              onChange={(
                value
              ) =>
                setFormData({
                  ...formData,
                  duration:
                    value
                })
              }
            />
          </div>

          <div>
            <label>
              Số lần làm
            </label>
            <InputNumber
              style={{
                width: "100%"
              }}
              min={1}
              value={
                formData.attempt_limit
              }
              onChange={(
                value
              ) =>
                setFormData({
                  ...formData,
                  attempt_limit:
                    value
                })
              }
            />
          </div>
        </div>

        <label>
          Mật khẩu
        </label>
        <Input
          prefix={
            <LockOutlined />
          }
          value={
            formData.session_password
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              session_password:
                e.target.value
            })
          }
        />
      </Card>

      {/* CARD 3 */}
      <Card className="form-card">
        <h3>
          <SettingOutlined />
          Cấu hình
        </h3>

        <div className="switch-row">
          <span>
            Trộn câu hỏi
          </span>
          <Switch
            checked={
              formData.shuffle_questions
            }
            onChange={(
              checked
            ) =>
              setFormData({
                ...formData,
                shuffle_questions:
                  checked
              })
            }
          />
        </div>

        <div className="switch-row">
          <span>
            Trộn đáp án
          </span>
          <Switch
            checked={
              formData.shuffle_answers
            }
            onChange={(
              checked
            ) =>
              setFormData({
                ...formData,
                shuffle_answers:
                  checked
              })
            }
          />
        </div>

        <div className="switch-row">
          <span>
            Auto submit
          </span>
          <Switch
            checked={
              formData.auto_submit
            }
            onChange={(
              checked
            ) =>
              setFormData({
                ...formData,
                auto_submit:
                  checked
              })
            }
          />
        </div>

        <div className="switch-row">
          <span>
            Cho xem đáp án
          </span>
          <Switch
            checked={
              formData.allow_review
            }
            onChange={(
              checked
            ) =>
              setFormData({
                ...formData,
                allow_review:
                  checked
              })
            }
          />
        </div>
      </Card>

      <div className="submit-row">
        <Button
          className="bt-cancle"
          type="primary"
          onClick={() =>
            navigate(
              "/teacher/sessionList"
            )
          }
        >
          Hủy
        </Button>

        <Button
          className="bt-back"
          type="primary"
          onClick={
            handleCreate
          }
        >
          Tạo kỳ thi
        </Button>
      </div>
    </div>
  );
}

export default CreateSession;