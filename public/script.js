// script.js - multilingual TTS with English + Chinese detection

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

// 🧠 Detect language by character pattern
function detectLang(text) {
  return /[\u4e00-\u9fa5]/.test(text) ? "zh-CN" : "en-GB";
}

// 🔈 Find voice for English or Chinese
function getVoiceForLang(lang) {
  const voices = speechSynthesis.getVoices();
  if (lang === "zh-CN") {
    return voices.find(v => v.lang === "zh-CN") || voices.find(v => v.name.includes("Google 普通话 女声"));
  } else {
    return voices.find(v => v.lang === "en-GB") || voices.find(v => v.name.includes("Google UK English Female"));
  }
}

// 🔊 Speak each segment in its correct language
function speakMixed(text) {
  const segments = text.split(/(?<=[。.!?])/);
  segments.forEach(segment => {
    const trimmed = segment.trim();
    if (trimmed) {
      const lang = detectLang(trimmed);
      const utter = new SpeechSynthesisUtterance(trimmed);
      utter.lang = lang;
      utter.voice = getVoiceForLang(lang);
      utter.rate = 1;
      speechSynthesis.speak(utter);
    }
  });
}

// ✅ Main TTS function with multilingual playback
function playTTS() {
  const english = responseBox.textContent.trim();
  const chinese = translationBox.textContent.replace(/^🇨🇳 中文翻译：/, "").trim();
  speakMixed(`${english} ${chinese}`);
}

document.getElementById("ttsBtn")?.addEventListener("click", playTTS);

// 🎤 Hold-to-speak microphone
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "zh-CN"; // or "en-US" depending on the student
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

// 🔄 Make function global
window.submitQuestion = submitQuestion;
