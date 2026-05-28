import { useState } from "react";

import {
  Card,
  Table,
  Input,
  Button,
  Modal,
  message
} from "antd";

import {
  SearchOutlined,
  DeleteOutlined
} from "@ant-design/icons";

import AddStudentModal from "./AddStudentModal";

import {
  removeStudentService
} from "../../../services/classService";

function StudentTable({
  students,
  classId,
  onReload
}) {

  const [searchText,
    setSearchText] =
    useState("");

  const [openModal,
    setOpenModal] =
    useState(false);

  const filteredStudents =
    students.filter(
      (student) =>

        student.name
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          ) ||

        student.email
          .toLowerCase()
          .includes(
            searchText.toLowerCase()
          )
    );

  const handleDeleteStudent =
    (studentId) => {

      Modal.confirm({

        title:
          "Xóa sinh viên khỏi lớp?",

        content:
          "Sinh viên sẽ bị xóa khỏi lớp học này.",

        okText:
          "Xóa",

        cancelText:
          "Hủy",

        okButtonProps: {
          danger: true
        },

        async onOk() {

          try {

            await removeStudentService(
              classId,
              studentId
            );

            message.success(
              "Đã xóa sinh viên"
            );

            onReload?.();

          } catch (err) {

            console.log(err);

            message.error(
              "Xóa sinh viên thất bại"
            );
          }
        }
      });
    };

  const columns = [

    {
      title: "ID",

      dataIndex:
        "student_id"
    },

    {
      title: "Tên",

      dataIndex:
        "name"
    },

    {
      title: "Email",

      dataIndex:
        "email"
    },

    {
      title: "Thao tác",

      key:
        "action",

      width: 120,

      render: (_, record) => (

        <Button
          danger
          type="text"

          icon={
            <DeleteOutlined />
          }

          onClick={() =>
            handleDeleteStudent(
              record.student_id
            )
          }
        >
          Xóa
        </Button>
      )
    }
  ];

  return (

    <>

      <Card className="student-table-card">

        <div className="table-toolbar">

          <Input
            className="student-search"

            prefix={
              <SearchOutlined />
            }

            placeholder="Tìm theo tên hoặc email..."

            value={
              searchText
            }

            onChange={(e) =>
              setSearchText(
                e.target.value
              )
            }
          />

          <Button
            className="bt-add-student"

            onClick={() =>
              setOpenModal(true)
            }
          >
            + Thêm sinh viên
          </Button>

        </div>

        <Table
          dataSource={
            filteredStudents
          }

          columns={columns}

          rowKey="student_id"

          pagination={{
            pageSize: 5
          }}
        />

      </Card>

      <AddStudentModal
        open={openModal}

        onClose={() =>
          setOpenModal(false)
        }

        classId={classId}

        onSuccess={onReload}
      />

    </>
  );
}

export default StudentTable;