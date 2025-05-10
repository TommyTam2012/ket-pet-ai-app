// script.js

const examSelect = document.getElementById("examSelect");
const pdfViewer = document.getElementById("pdfViewer");
const questionInput = document.getElementById("questionInput");
const responseBox = document.getElementById("responseBox");
const historyList = document.getElementById("historyList");

examSelect.addEventListener("change", () => {
  const selectedFile = examSelect.value;
  if (selectedFile) {
    pdfViewer.src = `/assets/exams/${selectedFile}`;
  } else {
    pdfViewer.src = "";
  }
});

function submitQuestion() {
  const question = questionInput.value.trim();
  if (!question) return;

  responseBox.textContent = "正在获取回答，请稍候...";

  // Placeholder: Replace with actual PNG base64 logic or backend call
  fetch("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: question,
      image_base64: "iVBORw0KGgoAAA..." // Replace with real image
    })
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
