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
let currentPages = 13;

const pageCountMap = {
  ket01: 13,
  ket02: 10,
  ket03: 13,
  ket04: 13,
  ket05: 13,
  pet01: 13,
  pet02: 13,
  pet03: 13,
  pet04: 13,
  pet05: 13
};

const answerKey = {
  pet01: {
    33: {
      answer: "B",
      explanation: "B is correct because it logically completes the sentence in the reading cloze task."
    }
  }
};

function setExam(examId) {
  currentExamId = examId;
  currentPages = pageCountMap[examId] || 13;
  const folder = examId.startsWith("pet") ? "pet" : "KET";
  const pdfUrl = `/exams/${folder}/${examId}.pdf`;
  window.open(pdfUrl, "_blank");
  console.log(`📘 Exam set to ${examId}`);
}

function submitQuestion() {
  const userInput = questionInput.value.trim();
  if (!userInput || !currentExamId) {
    alert("⚠️ 请先选择试卷并输入问题。");
    return;
  }

  responseBox.textContent = "正在分析，请稍候...";
  translationBox.textContent = "";

  let normalizedId = currentExamId;
  if (/pet test 1/i.test(userInput)) normalizedId = "pet01";
  if (/pet test 2/i.test(userInput)) normalizedId = "pet02";
  if (/ket test 1/i.test(userInput)) normalizedId = "ket01";
  if (/ket test 2/i.test(userInput)) normalizedId = "ket02";

  const level = normalizedId.startsWith("pet") ? "PET" : "KET";
  const examName = `${level} Test ${normalizedId.slice(-1)}`;

  const match = userInput.match(/(?:Q|Question|问题)\s*(\d+)/i);
  const questionNumber = match ? parseInt(match[1]) : null;
  const entry = answerKey[normalizedId]?.[questionNumber];

  let messages = [];

  if (entry?.answer && entry?.explanation) {
    messages = [{
      type: "text",
      text: `
The student is asking about ${examName}, Question ${questionNumber}.
The correct answer is: ${entry.answer}
Explanation: ${entry.explanation}
Please explain this answer to the student in simple English so they understand why it is correct.
`.trim()
    }];
  } else {
    messages = [{
      type: "text",
      text: `
The student said: "${userInput}"
They may be asking about a question from the ${examName}.
If possible, please try to help them by analyzing what they need.
`.trim()
    }];
  }

  // ✅ Dynamically check only existing images
  const folder = currentExamId.startsWith("pet") ? "pet" : "KET";
  const promises = [];

  for (let i = 1; i <= currentPages; i++) {
    const imageUrl = `${window.location.origin}/exams/${folder}/${currentExamId}_page${i}.png`;

    const checkImage = fetch(imageUrl, { method: "HEAD" })
      .then(res => {
        if (res.ok) {
          messages.push({
            type: "image_url",
            image_url: { url: imageUrl }
          });
        } else {
          console.warn(`⚠️ Skipped missing image: ${imageUrl}`);
        }
      })
      .catch(err => {
        console.warn(`⚠️ Error checking image ${imageUrl}`, err);
      });

    promises.push(checkImage);
  }

  Promise.all(promises).then(() => {
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userInput, messages })
    })
      .then(async res => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (err) {
          console.error("❌ GPT error:", err);
          return {
            response: "[⚠️ GPT 无法返回内容]",
            translated: "[⚠️ 无法获取翻译]"
          };
        }
      })
      .then(data => {
        const answer = data.response || "无法获取英文回答。";
        const translated = data.translated || "无法获取中文翻译。";

        responseBox.textContent = answer;
        translationBox.textContent = `🇨🇳 中文翻译：${translated}`;
        addToHistory(userInput, `${answer}<br><em>🇨🇳 中文翻译：</em>${translated}`);
      })
      .catch(err => {
        responseBox.textContent = "发生错误，请稍后重试。";
        console.error("❌ GPT request failed:", err);
      });

    questionInput.value = "";
  });
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

  let finalTranscript = "";
  let isHoldingMic = false;
  let restartCount = 0;
  const maxRestarts = 3;

  recognition.onstart = () => {
    micBtn.textContent = "🎤 正在录音... (松开发送)";
    finalTranscript = "";
  };

  recognition.onresult = (event) => {
    finalTranscript = event.results[0][0].transcript;
    console.log("📥 Captured:", finalTranscript);
  };

  recognition.onend = () => {
    if (isHoldingMic && restartCount < maxRestarts) {
      restartCount++;
      recognition.start();
    } else {
      micBtn.textContent = "🎤 语音提问";
      if (finalTranscript.trim()) {
        questionInput.value = finalTranscript;
        submitQuestion();
      } else {
        console.log("⚠️ 没有检测到语音内容。");
      }
    }
  };

  recognition.onerror = (event) => {
    console.error("🎤 Speech error:", event.error);
    micBtn.textContent = "🎤 语音提问";
  };

  micBtn.addEventListener("mousedown", () => {
    isHoldingMic = true;
    restartCount = 0;
    finalTranscript = "";
    recognition.start();
  });

  micBtn.addEventListener("mouseup", () => {
    isHoldingMic = false;
    recognition.stop();
  });

  micBtn.addEventListener("touchstart", () => {
    isHoldingMic = true;
    restartCount = 0;
    finalTranscript = "";
    recognition.start();
  });

  micBtn.addEventListener("touchend", () => {
    isHoldingMic = false;
    recognition.stop();
  });
}

window.submitQuestion = submitQuestion;
window.setExam = setExam;
