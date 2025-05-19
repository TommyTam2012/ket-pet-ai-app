// script.js - supports multiple tests with dynamic PNG page ranges

console.log("🟢 script.js loaded successfully");

const fileInfo = document.getElementById("fileInfo");
const responseBox = document.getElementById("responseBox");
const questionInput = document.getElementById("questionInput");
const historyList = document.getElementById("historyList");
const micBtn = document.getElementById("micBtn");
const translationBox = document.createElement("div");
translationBox.id = "chineseTranslation";
translationBox.style.marginTop = "10px";
translationBox.style.fontSize = "0.95em";
translationBox.style.color = "#333";
responseBox.insertAdjacentElement("afterend", translationBox);

let currentExamId = "ket01";
let currentExamPdf = "ket01.pdf";
let currentPages = 13; // default to 13 pages

const examMap = {
  ket01: { pdf: "ket01.pdf", pages: 13 },
  ket02: { pdf: "ket02.pdf", pages: 10 },
  ket03: { pdf: "ket03.pdf", pages: 13 },
  pet01: { pdf: "pet01.pdf", pages: 13 },
  pet02: { pdf: "pet02.pdf", pages: 13 },
  pet03: { pdf: "pet03.pdf", pages: 13 }
};

function setExam(examId) {
  if (!examMap[examId]) return;
  currentExamId = examId;
  currentExamPdf = examMap[examId].pdf;
  currentPages = examMap[examId].pages;

  fileInfo.innerHTML = `📄 PDF: <a href="/exams/${examId.startsWith('ket') ? 'KET' : 'PET'}/${currentExamPdf}" target="_blank">${currentExamPdf}</a><br>🖼️ PNG: ${examId}_page1.png ~ ${examId}_page${currentPages}.png`;
}

function submitQuestion() {
  console.log("🔥 submitQuestion triggered!");

  const question = questionInput.value.trim();
  if (!question || !currentExamId) {
    alert("⚠️ 请先选择试卷并输入问题。");
    return;
  }

  responseBox.textContent = "正在分析，请稍候...";
  translationBox.textContent = "";

  const imageMessages = [
    { type: "text", text: question }
  ];

  for (let i = 1; i <= currentPages; i++) {
    const imageUrl = `/exams/${currentExamId.startsWith('ket') ? 'KET' : 'PET'}/${currentExamId}_page${i}.png`;
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
    .then(async res => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (err) {
        console.error("❌ Server returned non-JSON:", text);
        throw new Error("服务器返回非 JSON 内容");
      }
    })
    .then(data => {
      const answer = data.response || "无法获取英文回答。";
      const translated = data.translated || "无法获取中文翻译。";

      responseBox.textContent = answer;
      translationBox.textContent = `🇨🇳 中文翻译：${translated}`;

      addToHistory(question, `${answer}<br><em>🇨🇳 中文翻译：</em>${translated}`);
    })
    .catch(err => {
      responseBox.textContent = "发生错误，请稍后重试。";
      console.error("❌ GPT error:", err);
    });

  questionInput.value = "";
}

function addToHistory(question, answer) {
  const li = document.createElement("li");
  li.innerHTML = `<strong>问：</strong>${question}<br/><strong>答：</strong>${answer}`;
  historyList.prepend(li);
}

// 🔊 Speech synthesis
let ukVoice;
window.speechSynthesis.onvoiceschanged = () => {
  const voices = speechSynthesis.getVoices();
  ukVoice = voices.find(v => v.name.includes("Google UK English Female")) ||
            voices.find(v => v.lang === "en-GB") ||
            voices[0];
};

function playTTS() {
  const englishText = responseBox.textContent.trim();
  if (!englishText) return;

  const utterance = new SpeechSynthesisUtterance(englishText);
  utterance.voice = ukVoice || speechSynthesis.getVoices()[0];
  utterance.lang = "en-GB";
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}

document.getElementById("ttsBtn")?.addEventListener("click", playTTS);

// 🎤 Hold-to-speak mic
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.addEventListener("mousedown", () => {
    recognition.start();
    micBtn.textContent = "🎤 正在录音... (松开发送)";
  });

  micBtn.addEventListener("mouseup", () => {
    recognition.stop();
    micBtn.textContent = "🎤 语音提问";
  });

  micBtn.addEventListener("touchstart", () => {
    recognition.start();
    micBtn.textContent = "🎤 正在录音... (松开发送)";
  });

  micBtn.addEventListener("touchend", () => {
    recognition.stop();
    micBtn.textContent = "🎤 语音提问";
  });

  recognition.onresult = (event) => {
    const spoken = event.results[0][0].transcript;
    questionInput.value = spoken;
    submitQuestion();
  };

  recognition.onerror = (event) => {
    alert("🎤 无法识别语音，请重试。");
    console.error("SpeechRecognition error:", event.error);
  };
}

window.submitQuestion = submitQuestion;
window.setExam = setExam;
