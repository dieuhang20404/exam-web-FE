import { Modal, Radio, Input, message, Select } from "antd";
import { useState } from "react";
import { addStudentsToClassService } from "../../../services/classService";

function AddStudentModal({ open, onClose, classId, teacherId, students = [], onSuccess }) {

  const [inviteType, setInviteType] = useState("existing");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [inviteEmail,setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const handleSubmit =async () => {
    if (inviteType === "existing") {
      try {
        await addStudentsToClassService(
          classId,
          teacherId,
          selectedStudents
        );
        message.success(
          "Thêm sinh viên thành công"
        );
        setSelectedStudents([]);
        onClose();
        onSuccess?.();
      } catch (err) {
        console.log(err);
        message.error("Thêm sinh viên thất bại");
      }
    }
    if (
    inviteType === "invite" ) {
      message.info("Chức năng gửi email mời đang được phát triển");
      console.log({classId, inviteEmail, inviteMessage });
      setInviteEmail("");
      setInviteMessage("");
      onClose();
    }
  };

  return (
  <Modal
    title="Thêm sinh viên vào lớp"
    open={open}
    onCancel={onClose}
    onOk={handleSubmit}
    okText={
      inviteType ===
      "existing"

        ? "Thêm sinh viên"

        : "Gửi lời mời"
    }
    cancelText="Hủy"
  >

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

      <Radio value="invite">
        Chưa có tài khoản
      </Radio>

    </Radio.Group>

    {inviteType ===
      "existing" && (

      <div>

        <label>
          Chọn sinh viên
        </label>

        <Select
          mode="multiple"
          style={{
            width: "100%"
          }}
          placeholder="Chọn sinh viên"
          value={
            selectedStudents
          }
          onChange={
            setSelectedStudents
          }
          options={students.map(
            (
              student
            ) => ({
              value:
                student.studentId,
              label:
                student.fullName
            })
          )}
        />

        <p className="hint-text">
          Chỉ hiển thị sinh viên
          đã có tài khoản.
        </p>

      </div>
    )}

    {inviteType ===
      "invite" && (

      <div>

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
          Chức năng gửi email sẽ
          được kết nối khi Backend
          hỗ trợ API Invite.
        </p>

      </div>
    )}

  </Modal>

  );
  }

  export default AddStudentModal;
