export const mockQuestion = {
    1: [
      {
        question_id: 101,
        content: "Java là ngôn ngữ lập trình gì?",
        difficulty: "Easy",
        author: "Nguyễn Văn A",
        type: "MCQ",
        answers: [
          { text: "Hướng đối tượng", correct: true },
          { text: "Hệ điều hành", correct: false },
          { text: "Database", correct: false },
          { text: "Framework", correct: false },
        ],
      },

      {
        question_id: 102,
        content: "Từ khóa dùng để kế thừa trong Java?",
        difficulty: "Medium",
        author: "Trần Thị B",
        type: "MCQ",
        answers: [
          { text: "extends", correct: true },
          { text: "implements", correct: false },
          { text: "inherit", correct: false },
          { text: "super", correct: false },
        ],
      },

      {
        question_id: 103,
        content: "Java hỗ trợ đa kế thừa class?",
        difficulty: "Hard",
        author: "Lê Văn C",
        type: "True/False",
        answers: [
          { text: "True", correct: false },
          { text: "False", correct: true },
        ],
      },
    ],

    2: [
      {
        question_id: 201,
        content: "React Hook dùng để làm gì?",
        difficulty: "Easy",
        author: "Admin",
        type: "MCQ",
        answers: [
          { text: "Quản lý state", correct: true },
          { text: "Kết nối DB", correct: false },
          { text: "Tạo API", correct: false },
          { text: "Render CSS", correct: false },
        ],
      },
    ],
  };