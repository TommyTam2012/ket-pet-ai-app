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

// ✅ SIMPLIFIED answerKey with explanations
const answerKey = {
  ket01: {
    1: { answer: "H", explanation: "H is correct because it matches the situation described in the question." },
    2: { answer: "C", explanation: "C is correct because the form should be placed in the car window." },
    3: { answer: "G", explanation: "G matches the changed transport notice in the prompt." },
    4: { answer: "D", explanation: "D is correct because Sonja asked her mom to pick up both items." },
    5: { answer: "A", explanation: "A explains that two hours is the recommended time clearly." }
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

  const match = question.match(/(?:Q|Question|问题)\s*(\d+)/i);
  const questionNumber = match ? parseInt(match[1]) : null;
  const answerData = answerKey[currentExamId]?.[questionNumber];

  let messages = [];

  if (answerData && answerData.answer && answerData.explanation) {
    // ✅ Use hardcoded answer + explanation, skip Vision
    const shortPrompt = `
The student is asking about Question ${questionNumber} from ${currentExamId.toUpperCase()}.
The correct answer is: ${answerData.answer}
Explanation: ${answerData.explanation}
Please explain this to the student in simple English, and help them understand why this answer is correct.
    `.trim();

    messages = [{ type: "text", text: shortPrompt }];
  } else {
    // ❗ Default fallback if no answer available
    messages = [{ type: "text", text: question }];
  }

  fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: question, messages })
  })
    .then(async res => {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (err) {
        console.error("❌ GPT error:", err);
        return {
          response: "[⚠️ GPT 无法返回内容]",
          translated: "[⚠️ 无法翻译内容]"
        };
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
      console.error("❌ GPT request failed:", err);
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
  return lang === "zh-CN"
    ? voices.find(v => v.lang === "zh-CN") || voices.find(v => v.name.includes("Google 普通话 女声"))
    : voices.find(v => v.lang === "en-GB") || voices.find(v => v.name.includes("Google UK English Female"));
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
  console.log("🛑 TTS stopped");
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
