// script.js - enhanced with PDF status feedback

const examSelect = document.getElementById("examSelect");
const pdfViewer = document.getElementById("pdfViewer");
const questionInput = document.getElementById("questionInput");
const responseBox = document.getElementById("responseBox");
const historyList = document.getElementById("historyList");
const fileInfo = document.getElementById("fileInfo");
const pdfStatus = document.getElementById("pdfStatus");

let currentExamPdf = "";
let currentExamId = "";

examSelect.addEventListener("change", () => {
  const selectedValue = examSelect.value;
  if (!selectedValue) return;

  const data = JSON.parse(selectedValue);
  currentExamPdf = data.pdf;
  currentExamId = data.id;

  const fullPdfPath = `/${currentExamPdf}`;
  pdfViewer.src = fullPdfPath;

  fileInfo.textContent = `📄 PDF: ${data.pdf}\n🖼️ PNG: ${data.id}_page1.png ~ ${data.id}_page13.png`;
  pdfStatus.textContent = `📄 正在加载试卷 (${data.pdf})...`;
});

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
