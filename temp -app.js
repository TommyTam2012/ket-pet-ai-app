// File: frontend/App.js

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function App() {
  const ketExams = [
    { id: "ket-exam-1", label: "KET 模拟考试 1", pdf: "/assets/exams/KET/ket-exam-1.pdf" },
    { id: "ket-exam-2", label: "KET 模拟考试 2", pdf: "/assets/exams/KET/ket-exam-2.pdf" },
    { id: "ket-exam-3", label: "KET 模拟考试 3", pdf: "/assets/exams/KET/ket-exam-3.pdf" },
    { id: "ket-exam-4", label: "KET 模拟考试 4", pdf: "/assets/exams/KET/ket-exam-4.pdf" },
  ];

  const petExams = [
    { id: "pet-exam-1", label: "PET 模拟考试 1", pdf: "/assets/exams/PET/pet-exam-1.pdf" },
    { id: "pet-exam-2", label: "PET 模拟考试 2", pdf: "/assets/exams/PET/pet-exam-2.pdf" },
    { id: "pet-exam-3", label: "PET 模拟考试 3", pdf: "/assets/exams/PET/pet-exam-3.pdf" },
    { id: "pet-exam-4", label: "PET 模拟考试 4", pdf: "/assets/exams/PET/pet-exam-4.pdf" },
  ];

  const [selectedExam, setSelectedExam] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);

  const handleSubmit = async () => {
    const newEntry = { question, answer: `模拟回答：${question}` }; // Replace with GPT API later
    setHistory((prev) => [...prev, newEntry]);
    setResponse(newEntry.answer);
    setQuestion("");
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="p-6 bg-blue-100 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">TommySir's KET、PET 阅读、语法 AI 辅助考试练习</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-2 text-blue-700 font-semibold">选择 KET 考试</div>
          <select
            className="w-full p-2 text-black rounded border border-blue-300 mb-4"
            onChange={(e) => setSelectedExam(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>请选择一个 KET 考试</option>
            {ketExams.map((exam) => (
              <option key={exam.id} value={exam.pdf}>{exam.label}</option>
            ))}
          </select>

          <div className="mb-2 text-blue-700 font-semibold">选择 PET 考试</div>
          <select
            className="w-full p-2 text-black rounded border border-blue-300"
            onChange={(e) => setSelectedExam(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>请选择一个 PET 考试</option>
            {petExams.map((exam) => (
              <option key={exam.id} value={exam.pdf}>{exam.label}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="mb-2 text-blue-700 font-semibold">文件预览</div>
          {selectedExam ? (
            <div className="bg-white rounded p-2 text-black max-h-[500px] overflow-y-auto border border-blue-200">
              <Document file={selectedExam} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages), (el, index) => (
                  <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
              </Document>
            </div>
          ) : (
            <div className="text-gray-500">请选择 KET 或 PET 考试</div>
          )}
        </div>

        <div>
          <div className="mb-2 text-blue-700 font-semibold">问题查询</div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="在此输入您的问题..."
            className="w-full h-28 p-2 text-black rounded border border-blue-300"
          />
          <button
            onClick={handleSubmit}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            提交问题
          </button>
        </div>

        <div>
          <div className="mb-2 text-blue-700 font-semibold">回答结果</div>
          <div className="bg-white text-gray-700 p-4 rounded min-h-[100px] border border-blue-200">
            {response || "提交问题后查看答案"}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-blue-700 font-semibold mb-2">历史对话</div>
        {history.length === 0 ? (
          <div className="text-gray-500">当前没有对话历史</div>
        ) : (
          <ul className="space-y-2">
            {history.map((item, index) => (
              <li key={index} className="bg-white text-gray-700 p-3 rounded border border-blue-200">
                <div className="text-sm text-blue-700">您问：{item.question}</div>
                <div className="text-sm text-green-600 mt-1">AI 回答：{item.answer}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
