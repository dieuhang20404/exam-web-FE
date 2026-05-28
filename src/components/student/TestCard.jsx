// src/components/student/TestCard.jsx

export default function TestCard({
  test,
  handleStartTest,
}) {

  return (

    <div className="test-card">

      <h3>{test.title}</h3>

      <p>
        <strong>Giáo viên:</strong>{" "}
        {test.teacher}
      </p>

      <p>
        <strong>Môn:</strong>{" "}
        {test.subject}
      </p>

      <p>
        <strong>Thời gian:</strong>{" "}
        {test.duration} phút
      </p>

      <p>
        <strong>Số câu:</strong>{" "}
        {test.questions} câu
      </p>

      <button
        onClick={() =>
          handleStartTest(test.id)
        }
      >
        Làm bài
      </button>

    </div>

  );
}