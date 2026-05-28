import { useEffect, useState } from "react";
import { Card, Col, Row, Spin, Empty, Button, Modal, Input, Upload, message, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { getMyClasses, createClass, deleteClass } from "../../../api/api";
import "./ClassManagement.css";
import { mockClasse } from "../../../mock/classMock";
import { UploadOutlined, MoreOutlined } from "@ant-design/icons";
import readXlsxFile from "read-excel-file/web-worker";

function ClassManagement() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const navigate = useNavigate();

  const mockClasses = mockClasse;

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);

    try {
      const res = await getMyClasses();
      const data = res.data || [];

      if (data.length === 0) {
        const savedClasses = JSON.parse(
          localStorage.getItem("mockClasses")
        );

        setClasses(savedClasses || mockClasses);
      } else {
        setClasses(data);
      }
    } catch (err) {
      console.log("API lỗi");

      const savedClasses = JSON.parse(
        localStorage.getItem("mockClasses")
      );

      setClasses(savedClasses || mockClasses);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass =
    async () => {
      if (
        !newClassName.trim()
      ) {
        message.warning(
          "Nhập tên lớp"
        );
        return;
      }

      try {
        const payload = {
          class_name:
            newClassName
        };

        const res =
          await createClass(
            payload
          );

        const newClass =
          res.data;

        setClasses([
          ...classes,
          newClass
        ]);

        message.success(
          "Tạo lớp thành công"
        );

        setOpenCreateModal(
          false
        );

        setNewClassName(
          ""
        );

      } catch (err) {
        console.log(err);

        message.error(
          "Tạo lớp thất bại"
        );
      }
    };

  const handleDeleteClass =
    async (
      classId
    ) => {
      try {
        await deleteClass(
          classId
        );

        const updatedClasses =
          classes.filter(
            (
              item
            ) =>
              item.class_id !==
              classId
          );

        setClasses(
          updatedClasses
        );

        message.success(
          "Xóa lớp thành công"
        );

      } catch (err) {
        console.log(
          err
        );

        message.error(
          "Xóa lớp thất bại"
        );
      }
    };

  return (
    <div className="class-container">
      <Button 
        className="bt-new-class"
        onClick={() => setOpenCreateModal(true)}
      > Thêm lớp học mới </Button>

      {loading ? (
        <div className="loading">
          <Spin size="large" />
        </div>
      ) : classes.length === 0 ? (
        <Empty description="Chưa có lớp nào" />
      ) : (
        <Row gutter={[16, 16]}>
          {classes.map((item) => (
              <Col span={8} key={item.class_id}>
                <Card
                  className="class-card"
                  onClick={() =>
                    navigate(
                      `/teacher/class/${item.class_id}`
                    )
                  }
                >
                  {/* top */}
                  <div className="card-header">
                    <div className="class-icon">
                      📘
                    </div>

                    <Dropdown
                      menu={{
                         className: "class-dropdown-menu",
                        items: [
                          {
                            key: "delete",
                            label: "Xóa lớp",
                            danger: true,
                            onClick: (e) => {
                              e.domEvent.stopPropagation();
                              setSelectedClassId(item.class_Id);
                              setOpenDeleteModal(true);
                            }
                          }
                        ]
                      }}
                      trigger={["click"]}
                    >
                      <MoreOutlined
                        className="more-icon"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      />
                    </Dropdown>
                  </div>

                  {/* class code */}
                  <p className="class-code">
                    MÃ LỚP: {item.class_id}
                  </p>

                  {/* class name */}
                  <h2 className="class-name">
                    {item.class_name}
                  </h2>

                  {/* student */}
                  <p className="student-count">
                    👨‍🎓 {item.total_students} học sinh
                  </p>

                </Card>
              </Col>
            ))}
        </Row>
      )}
      <Modal
        className="create-class-modal"
        title="Tạo lớp học mới"
        open={openCreateModal}
        onCancel={() =>
          setOpenCreateModal(
            false
          )
        }
        onOk={
          handleCreateClass
        }
        okText="Tạo"
        cancelText="Hủy"
      >
        <div className="create-form">
          <label>
            Tên lớp
          </label>

          <Input
            placeholder="Nhập tên lớp..."
            value={
              newClassName
            }
            onChange={(
              e
            ) =>
              setNewClassName(
                e.target.value
              )
            }
          />
        </div>
      </Modal>
      <Modal
        className="create-class-modal"
        title="Xác nhận xóa lớp"
        open={
          openDeleteModal
        }
        onCancel={() =>
          setOpenDeleteModal(
            false
          )
        }
        onOk={() =>
          handleDeleteClass(
            selectedClassId
          )
        }
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>
          Bạn chắc chắn muốn
          xóa lớp này?
        </p>
      </Modal>
    </div>
  );
}

export default ClassManagement;