import { Modal, Radio, Input, message, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import * as XLSX from "xlsx";

import {addStudentToClassService, addStudentsToClassService} from "../../../services/classService";

function AddStudentModal({
  open,
  onClose,
  classId,
  students = [],
  onSuccess
}) {
  const [mode, setMode] = useState("single");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fileData, setFileData] = useState([]);

  // ================= PARSE EXCEL =================
  const handleParseExcel = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(worksheet);

      // map đúng format backend cần
      const formatted = json.map((item) => ({
        fullName: item.fullname || item.fullName,
        email: item.email
      }));

      setFileData(formatted);
    };

    reader.readAsArrayBuffer(file);

    return false; // chặn upload auto
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      // ===== SINGLE =====
      if (mode === "single") {
        if (!selectedStudent) {
          message.warning("Chọn sinh viên");
          return;
        }

        await addStudentToClassService(classId, selectedStudent);

        message.success("Thêm sinh viên thành công");
      }

      // ===== BULK =====
      if (mode === "excel") {
        if (!fileData.length) {
          message.warning("File Excel trống hoặc chưa chọn");
          return;
        }

        await addStudentsToClassService(classId, fileData);

        message.success("Thêm danh sách sinh viên thành công");
      }

      setSelectedStudent(null);
      setFileData([]);
      onClose();
      onSuccess?.();

    } catch (err) {
      console.log(err);
      message.error("Thao tác thất bại");
    }
  };

  return (
    <Modal
      title="Thêm sinh viên"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      {/* MODE */}
      <Radio.Group
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        style={{ marginBottom: 20, display: "flex", gap: 20 }}
      >
        <Radio value="single">Thêm 1 sinh viên</Radio>
        <Radio value="excel">Import Excel</Radio>
      </Radio.Group>

      {/* SINGLE */}
      {mode === "single" && (
        <Select
          style={{ width: "100%" }}
          placeholder="Chọn sinh viên"
          value={selectedStudent}
          onChange={setSelectedStudent}
          options={students.map((s) => ({
            value: s.studentId,
            label: `${s.fullName} (${s.email})`
          }))}
        />
      )}

      {/* EXCEL */}
      {mode === "excel" && (
        <>
          <Upload beforeUpload={handleParseExcel} maxCount={1}>
            <Button icon={<UploadOutlined />}>
              Chọn file Excel
            </Button>
          </Upload>

          <p style={{ marginTop: 10, fontSize: 12 }}>
            File phải có cột: <b>fullname</b>, <b>email</b>
          </p>

          {fileData.length > 0 && (
            <p style={{ color: "green" }}>
              Đã đọc: {fileData.length} sinh viên
            </p>
          )}
        </>
      )}
    </Modal>
  );
}

export default AddStudentModal;