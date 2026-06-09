// src/components/student/TestCard.jsx

export default function TestCard({
  test,
  handleStartTest,
}) {

  return (

    <div className="test-card">

      <h3>
        {test.session_name}
      </h3>

      <p>
        <strong>Môn học:</strong>{" "}
        {test.subject_name || "Chưa cập nhật"}
      </p>

      <p>
        <strong>Giáo viên:</strong>{" "}
        {test.teacher_name || "Chưa cập nhật"}
      </p>

      <p>
        <strong>Số câu hỏi:</strong>{" "}
        {test.number_of_questions ?? 0}
      </p>

      <p>
        <strong>Thời gian:</strong>{" "}
        {test.duration} phút
      </p>

      <p>
        <strong>Bắt đầu:</strong>{" "}
        {test.start_time
          ? new Date(test.start_time).toLocaleString()
          : "N/A"}
      </p>

      <p>
        <strong>Kết thúc:</strong>{" "}
        {test.end_time
          ? new Date(test.end_time).toLocaleString()
          : "N/A"}
      </p>

      <p>
        <strong>Số lần làm:</strong>{" "}
        {test.attempt_limit}
      </p>

      <p>
        <strong>Trạng thái:</strong>{" "}
        {test.session_status}
      </p>

      <button
        onClick={() =>
          handleStartTest(test.session_id)
        }
      >
        Làm bài
      </button>

    </div>

  );

}