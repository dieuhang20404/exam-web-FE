export const mockQuestion = [
   {
    questionId: 1,
    subjectId: 1,
    createdBy: 1,
    qType: "SINGLE_CHOICE",
    content: "Java là ngôn ngữ lập trình thuộc mô hình nào?",
    difficulty: "EASY",
    isActive: true,
    answers: [
      {
        answerId: 1,
        isCorrect: true,
        content: "Lập trình hướng đối tượng",
        orderIndex: 1,
      },
      {
        answerId: 2,
        isCorrect: false,
        content: "Hệ điều hành",
        orderIndex: 2,
      },
      {
        answerId: 3,
        isCorrect: false,
        content: "Cơ sở dữ liệu",
        orderIndex: 3,
      },
      {
        answerId: 4,
        isCorrect: false,
        content: "Mạng máy tính",
        orderIndex: 4,
      },
    ],
  },

  {
    questionId: 2,
    subjectId: 1,
    createdBy: 1,
    qType: "MULTIPLE_CHOICE",
    content: "Những framework nào thuộc hệ sinh thái Java?",
    difficulty: "MEDIUM",
    isActive: true,
    answers: [
      {
        answerId: 5,
        isCorrect: true,
        content: "Spring Boot",
        orderIndex: 1,
      },
      {
        answerId: 6,
        isCorrect: true,
        content: "Hibernate",
        orderIndex: 2,
      },
      {
        answerId: 7,
        isCorrect: false,
        content: "Laravel",
        orderIndex: 3,
      },
      {
        answerId: 8,
        isCorrect: false,
        content: "Django",
        orderIndex: 4,
      },
    ],
  },

  {
    questionId: 3,
    subjectId: 1,
    createdBy: 1,
    qType: "TRUE_FALSE",
    content: "Java hỗ trợ tính đa hình (Polymorphism).",
    difficulty: "EASY",
    isActive: true,
    answers: [
      {
        answerId: 9,
        isCorrect: true,
        content: "Đúng",
        orderIndex: 1,
      },
      {
        answerId: 10,
        isCorrect: false,
        content: "Sai",
        orderIndex: 2,
      },
    ],
  },

  {
    questionId: 4,
    subjectId: 2,
    createdBy: 1,
    qType: "SINGLE_CHOICE",
    content: "Spring Boot sử dụng server nhúng mặc định nào?",
    difficulty: "HARD",
    isActive: true,
    answers: [
      {
        answerId: 11,
        isCorrect: true,
        content: "Tomcat",
        orderIndex: 1,
      },
      {
        answerId: 12,
        isCorrect: false,
        content: "Nginx",
        orderIndex: 2,
      },
      {
        answerId: 13,
        isCorrect: false,
        content: "Apache HTTP Server",
        orderIndex: 3,
      },
      {
        answerId: 14,
        isCorrect: false,
        content: "IIS",
        orderIndex: 4,
      },
    ],
  },
];