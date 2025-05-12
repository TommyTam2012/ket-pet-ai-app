console.log("🟢 script.js loaded successfully");

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

// ✅ Answer Key (starting with ket01)
const answerKey = {
  ket01: {
    1: "H", 2: "C", 3: "G", 4: "D", 5: "A",
    6: "B", 7: "A", 8: "B", 9: "C", 10: "C",
    11: "C", 12: "B", 13: "C", 14: "A", 15: "C",
    16: "F", 17: "B", 18: "D", 19: "A", 20: "H",
    21: "A", 22: "C", 23: "A", 24: "B", 25: "A",
    26: "A", 27: "B", 28: "B", 29: "C", 30: "B",
    31: "B", 32: "A", 33: "C", 34: "A", 35: "C",
    36: "stadium", 37: "camera", 38: "beach", 39: "guitar", 40: "tent",
    41: "have", 42: "them", 43: "than", 44: "the", 45: "last",
    46: "this", 47: "with", 48: "go", 49: "ago", 50: "each",
    51: "Saturday", 52: "1.30", 53: "sweater", 54: "car", 55: "366387"
  },

  ket02: {
    1: "C", 2: "A", 3: "C", 4: "A", 5: "B", 6: "B",
    7: "B", 8: "A", 9: "C", 10: "A", 11: "B", 12: "A", 13: "B",
    14: "B", 15: "C", 16: "C", 17: "B", 18: "C",
    19: "C", 20: "C", 21: "B", 22: "A", 23: "B", 24: "C",
    25: "up", 26: "At", 27: "it", 28: "for", 29: "the", 30: "if"
  },

  pet01: {
    1: "C", 2: "B", 3: "A", 4: "B", 5: "B",
    6: "D", 7: "F", 8: "C", 9: "A", 10: "H",
    11: "A", 12: "A", 13: "B", 14: "B", 15: "A",
    16: "A", 17: "A", 18: "A", 19: "B", 20: "B",
    21: "C", 22: "D", 23: "D", 24: "B", 25: "D",
    26: "B", 27: "D", 28: "C", 29: "C", 30: "B",
    31: "D", 32: "C", 33: "B", 34: "C", 35: "A"
  },

  pet02: {
    1: "A", 2: "C", 3: "A", 4: "C", 5: "A",
    6: "H", 7: "E", 8: "G", 9: "C", 10: "D",
    11: "A", 12: "A", 13: "A", 14: "B", 15: "A",
    16: "A", 17: "A", 18: "B", 19: "A", 20: "B",
    21: "A", 22: "D", 23: "C", 24: "D", 25: "B",
    26: "B", 27: "D", 28: "A", 29: "A", 30: "B",
    31: "D", 32: "C", 33: "A", 34: "D", 35: "A"
  }
};

function setExam(examId) {
  currentExamId = examId;
  const folder = examId.startsWith("pet") ? "pet" : "KET";
  const pdfUrl = `/exams/${folder}/${examId}.pdf`;
  window.open(pdfUrl, "_blank");
  console.log(`📘 Exam set to ${examId}`);
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

  const examFolder = currentExamId.startsWith("pet") ? "pet" : "KET";
  const level = currentExamId.startsWith("pet") ? "PET" : "KET";

  const examPageCount = {
    ket01: 55,
    ket02: 10,
    pet01: 13,
    pet02: 13
  };

  const totalPages = examPageCount[currentExamId] || 13;

  // 🔍 Extract question number (e.g., Q3, Question 3, 问题 3)
  const match = question.match(/(?:Q|Question|问题)\s*(\d+)/i);
  const questionNumber = match ? parseInt(match[1]) : null;
  const officialAnswer = answerKey[currentExamId]?.[questionNumber];

  // 🧠 Instruction for GPT
  let instruction = `
You are an English teacher helping a student prepare for the ${level} exam, working on ${currentExamId.toUpperCase()}.

1. If the student pastes a short writing task (like an email or story), do NOT repeat the exam instructions. Instead, directly correct their writing: fix grammar, spelling, and structure. Then give 2–3 suggestions for improvement at the ${level} level.

2. If the student asks about a specific exam question (e.g., "Q3", "Question 3", or "问题 3"), use the provided exam images for ${currentExamId.toUpperCase()}. Find the correct question and give a direct answer. You must prioritize identifying and answering anything that includes "Q", "Question", or "问题" followed by a number.

`;

  if (officialAnswer && questionNumber) {
    instruction += `
The official answer for Question ${questionNumber} is: ${officialAnswer}.
Please confirm this by checking the exam image and then briefly explain why this answer is correct. If the image shows something different, explain your reasoning clearly.
`;
  }

  const imageMessages = [
    { type: "text", text: instruction },
    { type: "text", text: question }
  ];

  for (let i = 1; i <= totalPages; i++) {
    const imageUrl = `/exams/${examFolder}/${currentExamId}_page${i}.png`;
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

function detectLang(text) {
  return /[\u4e00-\u9fa5]/.test(text) ? "zh-CN" : "en-GB";
}

function getVoiceForLang(lang) {
  const voices = speechSynthesis.getVoices();
  if (lang === "zh-CN") {
    return voices.find(v => v.lang === "zh-CN") || voices.find(v => v.name.includes("Google 普通话 女声"));
  } else {
    return voices.find(v => v.lang === "en-GB") || voices.find(v => v.name.includes("Google UK English Female"));
  }
}

function speakMixed(text) {
  const segments = text.split(/(?<=[。.!?])/).map(s => s.trim()).filter(Boolean);
  let index = 0;

  function speakNext() {
    if (index >= segments.length) return;
    const segment = segments[index++];
    const lang = detectLang(segment);
    const utter = new SpeechSynthesisUtterance(segment);
    utter.lang = lang;
    utter.voice = getVoiceForLang(lang);
    utter.rate = 1;
    utter.onend = speakNext;
    speechSynthesis.speak(utter);
  }

  speechSynthesis.cancel();
  speakNext();
}

function playTTS() {
  const english = responseBox.textContent.trim();
  const chinese = translationBox.textContent.replace(/^🇨🇳 中文翻译：/, "").trim();
  speakMixed(`${english} ${chinese}`);
}

document.getElementById("ttsBtn")?.addEventListener("click", playTTS);

document.getElementById("stopTTSBtn")?.addEventListener("click", () => {
  speechSynthesis.cancel();
  console.log("🛑 TTS playback stopped");
});

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
