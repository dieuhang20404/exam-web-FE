import {
  Modal,
  Radio,
  Input,
  Button,
  Upload,
  message
} from "antd";

import {
  UploadOutlined
} from "@ant-design/icons";

import {
  useState
} from "react";

import { handleAddStudent, handleBulkImport, handleInviteStudent} from "../../../services/classService";

function AddStudentModal({
  open,
  onClose,
  classId,
  onSuccess
}) {

  const [inviteType,
    setInviteType] =
    useState("existing");

  // existing
  const [studentEmail,
    setStudentEmail] =
    useState("");

  // invite
  const [inviteEmail,
    setInviteEmail] =
    useState("");

  const [inviteMessage,
    setInviteMessage] =
    useState("");

  // bulk
  const [excelFile,
    setExcelFile] =
    useState(null);

  const handleSubmit =
    async () => {

      // ================= EXISTING =================

      if (
        inviteType ===
        "existing"
      ) {

        const result =
          await handleAddStudent({
            classId,
            email:
              studentEmail
          });

        if (
          result.success
        ) {

          message.success(
            result.message
          );

          setStudentEmail(
            ""
          );

          onClose();

          onSuccess();

        } else {

          message.error(
            result.message
          );
        }
      }

      // ================= BULK =================

      if (
        inviteType ===
        "bulk"
      ) {

        const result =
          await handleBulkImport({
            classId,
            file:
              excelFile
          });

        if (
          result.success
        ) {

          message.success(
            result.message
          );

          setExcelFile(
            null
          );

          onClose();

          onSuccess();

        } else {

          message.error(
            result.message
          );
        }
      }

      // ================= INVITE =================

      if (
        inviteType ===
        "invite"
      ) {

        const result =
          await handleInviteStudent({
            classId,
            email:
              inviteEmail,
            message:
              inviteMessage
          });

        if (
          result.success
        ) {

          message.success(
            result.message
          );

          setInviteEmail(
            ""
          );

          setInviteMessage(
            ""
          );

          onClose();

        } else {

          message.error(
            result.message
          );
        }
      }
    };

  return (

    <Modal
      className="modal"
      title="Thêm sinh viên vào lớp"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={
        inviteType ===
        "existing"

          ? "Thêm sinh viên"

          : inviteType ===
            "bulk"

          ? "Import danh sách"

          : "Gửi lời mời"
      }
      cancelText="Hủy"
    >

      {/* TYPE */}

      <Radio.Group
        value={inviteType}
        onChange={(e) =>
          setInviteType(
            e.target.value
          )
        }
        style={{
          marginBottom: 24,
          display: "flex",
          gap: 20
        }}
      >

        <Radio value="existing">
          Đã có tài khoản
        </Radio>

        <Radio value="bulk">
          Thêm nhiều sinh viên
        </Radio>

        <Radio value="invite">
          Chưa có tài khoản
        </Radio>

      </Radio.Group>

      {/* EXISTING */}

      {inviteType ===
        "existing" && (

        <div className="modal-section">

          <label>
            Email sinh viên
          </label>

          <Input
            placeholder="student@gmail.com"
            value={
              studentEmail
            }
            onChange={(e) =>
              setStudentEmail(
                e.target.value
              )
            }
          />

          <p className="hint-text">
            Sinh viên đã có tài khoản
            sẽ được thêm trực tiếp
            vào lớp học.
          </p>

        </div>
      )}

      {/* BULK */}

      {inviteType ===
        "bulk" && (

        <div className="modal-section">

          <label>
            Upload file Excel
          </label>

          <Upload
            beforeUpload={() =>
              false
            }
            maxCount={1}
            accept=".xlsx,.xls"
            onChange={(info) =>
              setExcelFile(
                info.file
              )
            }
          >

            <Button
              icon={
                <UploadOutlined />
              }
            >
              Chọn file Excel
            </Button>

          </Upload>

          <div
            style={{
              marginTop: 16
            }}
          >

            <Button type="link">
              Tải file mẫu
            </Button>

          </div>

          <p className="hint-text">
            File Excel cần có:
            Họ tên và Email sinh viên.
          </p>

        </div>
      )}

      {/* INVITE */}

      {inviteType ===
        "invite" && (

        <div className="modal-section">

          <label>
            Email sinh viên
          </label>

          <Input
            placeholder="student@gmail.com"
            value={
              inviteEmail
            }
            onChange={(e) =>
              setInviteEmail(
                e.target.value
              )
            }
          />

          <label
            style={{
              marginTop: 16,
              display:
                "block"
            }}
          >
            Lời nhắn
          </label>

          <Input.TextArea
            rows={4}
            placeholder="Mời bạn tham gia lớp học..."
            value={
              inviteMessage
            }
            onChange={(e) =>
              setInviteMessage(
                e.target.value
              )
            }
          />

          <p className="hint-text">
            Hệ thống sẽ gửi email
            đăng ký tài khoản và
            tham gia lớp học.
          </p>

        </div>
      )}

    </Modal>
  );
}

export default AddStudentModal;