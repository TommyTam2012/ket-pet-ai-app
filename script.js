// script.js - fallback to addEventListener for stable buttons

const questionInput = document.getElementById("questionInput");
const responseBox = document.getElementById("responseBox");
const historyList = document.getElementById("historyList");
const fileInfo = document.getElementById("fileInfo");

let currentExamId = "";
let currentExamPdf = "";

function loadExam(pdfFile, examId) {
  const pdfPath = `/exams/KET/${pdfFile}`;
  currentExamPdf = pdfFile;
  currentExamId = examId;

  fileInfo.innerHTML = `📄 PDF: <a href="${pdfPath}" target="_blank">${pdfFile}</a><br>🖼️ PNG: ${examId}_page1.png ~ ${examId}_page13.png`;

  const win = window.open(pdfPath, "_blank");
  if (!win || win.closed || typeof win.closed === "undefined") {
    alert("⚠️ 无法在新标签页打开 PDF，请检查浏览器设置。");
  }
}

function submitQuestion() {
  const question = questionInput.value.trim();
  if (!question || !currentExamId) return;

  responseBox.textContent = "正在分析，请稍候...";

  const imageMessages = [
    { type: "text", text: question }
  ];

  for (let i = 1; i <= 13; i++) {
    const imageUrl = `/exams/KET/${currentExamId}_page${i}.png`;
    imageMessages.push({
      type: "image_url",
      image_url: { url: window.location.origin + imageUrl }
    });
  }

  fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: question, messages: imageMessages })
  })
    .then((res) => res.json())
    .then((data) => {
      const answer = data.response || data.error || "无法获取回答。";
      responseBox.textContent = answer;
      addToHistory(question, answer);
    })
    .catch((err) => {
      responseBox.textContent = "发生错误，请稍后重试。";
      console.error(err);
    });

  questionInput.value = "";
}

function addToHistory(question, answer) {
  const li = document.createElement("li");
  li.innerHTML = `<strong>问：</strong>${question}<br/><strong>答：</strong>${answer}`;
  historyList.prepend(li);
}

// ✅ Attach stable button click listeners once DOM is loaded

document.addEventListener('DOMContentLoaded', () => {
  const btn1 = document.getElementById('btn-ket1');
  const btn2 = document.getElementById('btn-ket2');
  const btn3 = document.getElementById('btn-pet1');

  if (btn1) btn1.addEventListener('click', () => loadExam('ket-exam-1.pdf', 'ket01'));
  if (btn2) btn2.addEventListener('click', () => loadExam('ket-exam-2.pdf', 'ket02'));
  if (btn3) btn3.addEventListener('click', () => loadExam('pet-exam-1.pdf', 'pet01'));
});
