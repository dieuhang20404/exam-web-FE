
export const parseNormalExamToQuestions = (text, subjectId) => {
  const uppercaseText = text.toUpperCase();
  const lastIndexKeyword = uppercaseText.lastIndexOf("ĐÁP ÁN");
  
  if (lastIndexKeyword === -1) {
    throw new Error("Không tìm thấy tiêu đề 'ĐÁP ÁN' ở cuối trang văn bản!");
  }

  const examBodyText = text.substring(0, lastIndexKeyword); 
  const answerKeyText = text.substring(lastIndexKeyword);   

  const finalAnswerMap = {};
  const answerMatches = answerKeyText.matchAll(/(\d+)[\.\s]*([A-D])/gi);
  for (const match of answerMatches) {
    finalAnswerMap[match[1]] = match[2].toUpperCase();
  }

  const questionBlocks = examBodyText.split(/Câu\s?(\d+)[\:\.]/i);
  const questionsList = [];

  for (let i = 1; i < questionBlocks.length; i += 2) {
    const qNum = questionBlocks[i];
    const qBlockContent = questionBlocks[i + 1];
    
    if (!qBlockContent) continue;

    const lines = qBlockContent.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    let content = lines[0]; 
    let rawAnswers = [];

    lines.forEach((line) => {
      const optionMatch = line.match(/^([A-D])[\.\s]+(.*)/i);
      if (optionMatch) {
        rawAnswers.push({
          content: optionMatch[2].trim(),
          orderIndex: optionMatch[1].toUpperCase()
        });
      }
    });

    let qType = "single";
    if (rawAnswers.length === 2 && 
        (rawAnswers[0].content.includes("Đúng") || rawAnswers[1].content.includes("Sai"))) {
      qType = "true_false";
    }

    const targetCorrectLetter = finalAnswerMap[qNum]; 

    const finalAnswers = rawAnswers.map((ans) => ({
      content: ans.content,
      orderIndex: ans.orderIndex,
      isCorrect: ans.orderIndex === targetCorrectLetter
    }));

    if (content && finalAnswers.length > 0) {
      questionsList.push({
        subjectId: subjectId,
        qType: qType,
        content: content,
        difficulty: 1, 
        answers: finalAnswers
      });
    }
  }

  return questionsList;
};