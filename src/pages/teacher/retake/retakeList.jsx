import { useEffect, useState } from "react";
import { Table, Tag, Button, Modal, InputNumber, DatePicker, message, Spin, Space } from "antd";
import { CheckOutlined, CloseOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import {
  getRetakesService,
  rejectRetakeService,
  grantRetakePermissionService
} from "../../../services/retakeService";

function RetakePage() {
  const [retakes, setRetakes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openGrantModal, setOpenGrantModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [permissionForm, setPermissionForm] = useState({
    availableFrom: null,
    availableTo: null,
    maxAttempt: 1
  });

  const loadRetakes = async () => {
    try {
      setLoading(true);
      const res = await getRetakesService({ page: 1, limit: 20 });
      setRetakes(res?.data || res || []);
    } catch (err) {
      message.error("Không thể tải danh sách yêu cầu thi lại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRetakes();
  }, []);

  const handleOpenRejectConfirm = (record) => {
    const requestId = record.requestId || record.request_id;
    
    Modal.confirm({
      title: `Từ chối yêu cầu thi lại #${requestId}?`,
      content: "Hành động này sẽ chuyển trạng thái yêu cầu thành REJECTED và không thể hoàn tác.",
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await rejectRetakeService(requestId);
          message.success("Đã từ chối yêu cầu thi lại thành công");
          loadRetakes();
        } catch {
          message.error("Thao tác từ chối thất bại");
        }
      }
    });
  };

  const handleOpenGrantModal = (record) => {
    setSelectedRecord(record);
    setPermissionForm({
      availableFrom: null,
      availableTo: null,
      maxAttempt: 1
    });
    setOpenGrantModal(true);
  };

  const handleConfirmGrant = async () => {
    if (!permissionForm.availableFrom || !permissionForm.availableTo) {
      message.warning("Vui lòng thiết lập đầy đủ Khoảng thời gian hiệu lực!");
      return;
    }

    if (permissionForm.availableFrom.isAfter(permissionForm.availableTo)) {
      message.error("Thời gian bắt đầu không được lớn hơn thời gian kết thúc!");
      return;
    }

    const requestId = selectedRecord?.requestId || selectedRecord?.request_id;

    try {
      const payload = {
        availableFrom: permissionForm.availableFrom.toISOString(),
        availableTo: permissionForm.availableTo.toISOString(),
        maxAttempt: Number(permissionForm.maxAttempt)
      };

      await grantRetakePermissionService(requestId, payload);
      message.success("Đã phê duyệt và cấp quyền thi lại thành công!");
      
      setOpenGrantModal(false);
      setSelectedRecord(null);
      loadRetakes();
    } catch {
      message.error("Cấp quyền thi lại thất bại");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "requestId",
      key: "requestId",
      render: (text, record) => record.requestId || record.request_id || text
    },
    {
      title: "Mã kỳ thi",
      dataIndex: "sessionId",
      key: "sessionId",
      render: (text, record) => record.sessionId || record.session_id || text
    },
    {
      title: "Mã sinh viên",
      dataIndex: "studentId",
      key: "studentId",
      render: (text, record) => record.studentId || record.student_id || text
    },
    {
      title: "Lý do xin thi lại",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true
    },
    {
      title: "Trạng thái",
      dataIndex: "RetakeStatus",
      key: "RetakeStatus",
      align: "center",
      render: (_, record) => {
        const status = record.RetakeStatus || record.request_status;
        let color = "blue";
        let text = status || "CHƯA RÕ";

        if (status === "PENDING") {
          color = "orange";
          text = "Chờ duyệt";
        } else if (status === "REJECTED") {
          color = "red";
          text = "Từ chối";
        } else if (status === "APPROVED") {
          color = "green";
          text = "Đã duyệt";
        }

        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: "Thao tác xử lý",
      key: "action",
      align: "center",
      width: 240,
      render: (_, record) => {
        const status = record.RetakeStatus || record.request_status;
      
        if (status !== "PENDING") {
          return <span style={{ color: "#bfbfbf", fontSize: "13px" }}>Đã xử lý xong</span>;
        }

        return (
          <Space size="small">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleOpenGrantModal(record)}
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            >
              Chấp nhận
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => handleOpenRejectConfirm(record)}
            >
              Từ chối
            </Button>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <h2 style={{ marginBottom: 20 }}>Quản lý phê duyệt yêu cầu thi lại</h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" tip="Đang tải dữ liệu..." />
          </div>
        ) : (
          <Table
            rowKey={(record) => String(record.requestId || record.request_id)}
            columns={columns}
            dataSource={retakes}
            pagination={{ pageSize: 10 }}
          />
        )}
      </div>
      <Modal
        open={openGrantModal}
        onCancel={() => {
          setOpenGrantModal(false);
          setSelectedRecord(null);
        }}
        title={
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            <CalendarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
            Cấu hình thời gian thi lại cho sinh viên
          </div>
        }
        okText="Phê duyệt & Cấp quyền"
        cancelText="Hủy bỏ"
        onOk={handleConfirmGrant}
        width={500}
      >
        {selectedRecord && (
          <div style={{ marginTop: 15 }}>
            <div style={{ padding: "12px", background: "#e6f7ff", borderRadius: 6, marginBottom: 20, fontSize: "14px" }}>
              <p style={{ margin: "0 0 6px 0" }}><b>Mã yêu cầu:</b> #{selectedRecord.requestId || selectedRecord.request_id}</p>
              <p style={{ margin: "0 0 6px 0" }}><b>Sinh viên ID:</b> {selectedRecord.studentId || selectedRecord.student_id}</p>
              <p style={{ margin: 0 }}><b>Lý do xin:</b> <i>{selectedRecord.reason}</i></p>
            </div>

            {/* Form chọn thời gian */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Thời gian mở đề từ:</label>
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày giờ bắt đầu"
                  format="HH:mm:ss DD/MM/YYYY"
                  value={permissionForm.availableFrom}
                  onChange={(v) => setPermissionForm({ ...permissionForm, availableFrom: v })}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Thời gian khóa đề đến:</label>
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày giờ kết thúc"
                  format="HH:mm:ss DD/MM/YYYY"
                  value={permissionForm.availableTo}
                  onChange={(v) => setPermissionForm({ ...permissionForm, availableTo: v })}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontWeight: 500 }}>Số lượt thi tối đa cho phép:</label>
                <InputNumber
                  min={1}
                  max={5}
                  style={{ width: "100%" }}
                  value={permissionForm.maxAttempt}
                  onChange={(v) => setPermissionForm({ ...permissionForm, maxAttempt: v })}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default RetakePage;