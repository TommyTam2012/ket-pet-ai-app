// script.js - updated with British female TTS and persistent bilingual output

console.log("🟢 script.js loaded successfully");

const fileInfo = document.getElementById("fileInfo");
const responseBox = document.getElementById("responseBox");
const questionInput = document.getElementById("questionInput");
const historyList = document.getElementById("historyList");
const translationBox = document.createElement("div");
translationBox.id = "chineseTranslation";
translationBox.style.marginTop = "10px";
translationBox.style.fontSize = "0.95em";
translationBox.style.color = "#333";
responseBox.insertAdjacentElement("afterend", translationBox);

let currentExamId = "ket01";
let currentExamPdf = "ket01.pdf";

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

function playTTS() {
  const englishText = responseBox.textContent.trim();
  if (!englishText) return;

  const voices = speechSynthesis.getVoices();
  let ukFemale = voices.find(v => v.name.includes("Google UK English Female"));
  if (!ukFemale) ukFemale = voices.find(v => v.lang === "en-GB");
  if (!ukFemale) ukFemale = voices[0];

  const utterance = new SpeechSynthesisUtterance(englishText);
  utterance.voice = ukFemale;
  utterance.lang = "en-GB";
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}

document.getElementById("ttsBtn")?.addEventListener("click", playTTS);

window.submitQuestion = submitQuestion;
