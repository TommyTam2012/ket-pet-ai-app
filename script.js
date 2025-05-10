<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KET / PET AI 考试助手</title>
  <link rel="stylesheet" href="/style.css">
  <style>
    .exam-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 20px;
    }
    .exam-btn {
      background: #003366;
      color: white;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 16px;
      width: 180px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .exam-btn:hover {
      background: #0055aa;
    }
  </style>
</head>
<body>
  <header>
    <h1>TommySir 的 KET / PET 阅读与语法 AI 辅助考试</h1>
  </header>

  <main>
    <section class="selectors">
      <h2>选择考试：</h2>
      <div class="exam-grid">
        <a class="exam-btn" href="/exams/KET/ket-exam-1.pdf" target="_blank">📄 KET Test 1</a>
        <a class="exam-btn" href="/exams/KET/ket-exam-2.pdf" target="_blank">📄 KET Test 2</a>
        <a class="exam-btn" href="/exams/PET/pet-exam-1.pdf" target="_blank">📄 PET Test 1</a>
      </div>
    </section>
  </main>
</body>
</html>
