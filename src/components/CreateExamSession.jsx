import {
  Modal,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Switch,
  Divider
} from "antd";

import {
  CalendarOutlined,
  LockOutlined,
  FileTextOutlined,
  SettingOutlined
} from "@ant-design/icons";

import "./CreateExamSession.css";

function CreateExamSession({
  open,
  onCancel,
  onOk,
  formData,
  setFormData,
  templates = []
}) {
  return (
    <Modal
      title="📘 Tạo kỳ thi mới"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="Tạo kỳ thi"
      cancelText="Hủy"
      width={760}
      className="exam-modal"
    >
      <div className="exam-form">

        {/* SECTION 1 */}
        <div className="form-section">
          <h3>
            <FileTextOutlined />
            Thông tin kỳ thi
          </h3>

          <label>Tên kỳ thi</label>
          <Input
            placeholder="VD: Java Midterm"
            value={formData.session_name}
            onChange={(e) =>
              setFormData({
                ...formData,
                session_name: e.target.value
              })
            }
          />

          <label>Chọn đề thi</label>
          <Select
            placeholder="Chọn đề thi"
            value={formData.template_id}
            onChange={(value) =>
              setFormData({
                ...formData,
                template_id: value
              })
            }
            options={templates.map((t) => ({
              value: t.template_id,
              label: t.template_name
            }))}
          />
        </div>

        <Divider />

        {/* SECTION 2 */}
        <div className="form-section">
          <h3>
            <CalendarOutlined />
            Thời gian & truy cập
          </h3>

          <label>Thời gian bắt đầu</label>
          <DatePicker
            showTime
            style={{ width: "100%" }}
            placeholder="Chọn thời gian bắt đầu"
            value={formData.start_time}
            onChange={(date) =>
              setFormData({
                ...formData,
                start_time: date
              })
            }
          />

          <label>Thời gian kết thúc</label>
          <DatePicker
            showTime
            style={{ width: "100%" }}
            placeholder="Chọn thời gian kết thúc"
            value={formData.end_time}
            onChange={(date) =>
              setFormData({
                ...formData,
                end_time: date
              })
            }
          />

          <div className="grid-2">
            <div>
              <label>Thời lượng (phút)</label>
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                value={formData.duration}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    duration: value
                  })
                }
              />
            </div>

            <div>
              <label>Số lần làm</label>
              <InputNumber
                min={1}
                style={{ width: "100%" }}
                value={formData.attempt_limit}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    attempt_limit: value
                  })
                }
              />
            </div>
          </div>

          <label>Mật khẩu kỳ thi</label>
          <Input
            className="password-input"
            prefix={<LockOutlined />}
            bordered={false}
            placeholder="Nhập mật khẩu"
            value={formData.session_password}
            onChange={(e) =>
              setFormData({
                ...formData,
                session_password: e.target.value
              })
            }
          />
        </div>

        <Divider />

        {/* SECTION 3 */}
        <div className="form-section">
          <h3>
            <SettingOutlined />
            Cấu hình bài thi
          </h3>

          <div className="switch-row">
            <span>Trộn câu hỏi</span>
            <Switch
              checked={formData.shuffle_questions}
              onChange={(checked) =>
                setFormData({
                  ...formData,
                  shuffle_questions: checked
                })
              }
            />
          </div>

          <div className="switch-row">
            <span>Trộn đáp án</span>
            <Switch
              checked={formData.shuffle_answers}
              onChange={(checked) =>
                setFormData({
                  ...formData,
                  shuffle_answers: checked
                })
              }
            />
          </div>

          <div className="switch-row">
            <span>Tự động nộp bài</span>
            <Switch
              checked={formData.auto_submit}
              onChange={(checked) =>
                setFormData({
                  ...formData,
                  auto_submit: checked
                })
              }
            />
          </div>

          <div className="switch-row">
            <span>Cho xem lại đáp án</span>
            <Switch
              checked={formData.allow_review}
              onChange={(checked) =>
                setFormData({
                  ...formData,
                  allow_review: checked
                })
              }
            />
          </div>

          <div className="switch-row">
            <span>Hiện điểm sau khi nộp</span>
            <Switch
              checked={formData.show_result}
              onChange={(checked) =>
                setFormData({
                  ...formData,
                  show_result: checked
                })
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CreateExamSession;