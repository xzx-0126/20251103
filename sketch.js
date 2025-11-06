let questions = [];
let selectedQuestions = [];
let currentQuestion = 0;
let score = 0;
let gameState = 'START'; // START, QUIZ, END
let userAnswers = [];
let table;
let baseFontSize; // 基礎字型大小
let scaleFactor; // 縮放因子
// confetti 狀態
let confettiParticles = [];
let confettiActive = false;
let confettiColors = ['#ff4d4d', '#ffd24d', '#4dff88', '#4dd0ff', '#b84dff', '#ff7ab3'];
let confettiMaxParticles = 400; // 上限，避免無限制累積
let feedbackMessages = {
  excellent: ['太棒了！你是 P5.js 專家！'],
  good: ['好成績！繼續加油！'],
  needsImprovement: ['別氣餒，繼續努力！']
};

function preload() {
  table = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  loadQuestions();
  selectRandomQuestions(3);
  calculateScaling();
}

function draw() {
  background(240);
  
  switch(gameState) {
    case 'START':
      drawStartScreen();
      break;
    case 'QUIZ':
      drawQuizScreen();
      break;
    case 'END':
      drawEndScreen();
      break;
  }
}

function loadQuestions() {
  for (let i = 0; i < table.getRowCount(); i++) {
    let question = {
      question: table.getString(i, '題目'),
      options: [
        table.getString(i, '選項A'),
        table.getString(i, '選項B'),
        table.getString(i, '選項C'),
        table.getString(i, '選項D')
      ],
      correct: table.getString(i, '正確答案').charCodeAt(0) - 65 // 將 A,B,C,D 轉換為 0,1,2,3
    };
    questions.push(question);
  }
}

function selectRandomQuestions(num) {
  let tempQuestions = [...questions];
  selectedQuestions = [];
  for (let i = 0; i < num && tempQuestions.length > 0; i++) {
    let randIndex = floor(random(tempQuestions.length));
    selectedQuestions.push(tempQuestions[randIndex]);
    tempQuestions.splice(randIndex, 1);
  }
}

function drawStartScreen() {
  textSize(adaptiveTextSize(40));
  fill(0);
  text('P5.js 知識測驗', width/2, height/3);
  
  textSize(adaptiveTextSize(24));
  text('點擊開始測驗', width/2, height/2);
  
  // 繪製按鈕背景
  let buttonWidth = adaptiveSpacing(200);
  let buttonHeight = adaptiveSpacing(40);
  let isHover = mouseX > width/2 - buttonWidth/2 && mouseX < width/2 + buttonWidth/2 &&
                mouseY > height/2 - buttonHeight/2 && mouseY < height/2 + buttonHeight/2;
  
  fill(isHover ? 220 : 255);
  rect(width/2 - buttonWidth/2, height/2 - buttonHeight/2, buttonWidth, buttonHeight, adaptiveSpacing(10));
  
  fill(0);
  text('點擊開始測驗', width/2, height/2);
  
  // 滑鼠懸停效果
  if (isHover) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function drawQuizScreen() {
  let currentQ = selectedQuestions[currentQuestion];
  
  // 顯示題目編號和問題
  textSize(adaptiveTextSize(24));
  fill(0);
  text(`問題 ${currentQuestion + 1}/3`, width/2, height * 0.1);
  
  textSize(adaptiveTextSize(20));
  text(currentQ.question, width/2, height * 0.2);
  
  // 顯示選項
  let buttonWidth = adaptiveSpacing(300);
  let buttonHeight = adaptiveSpacing(60);
  let buttonSpacing = adaptiveSpacing(80);
  
  for (let i = 0; i < 4; i++) {
    let y = height * 0.3 + i * buttonSpacing;
    let isHover = mouseX > width/2 - buttonWidth/2 && mouseX < width/2 + buttonWidth/2 &&
                  mouseY > y - buttonHeight/2 && mouseY < y + buttonHeight/2;
    
    // 選項背景
    fill(isHover ? 200 : 255);
    rect(width/2 - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight, adaptiveSpacing(10));
    
    // 選項文字
    fill(0);
    text(String.fromCharCode(65 + i) + '. ' + currentQ.options[i], width/2, y);
    
    if (isHover) {
      cursor(HAND);
    }
  }
  
  if (!mouseIsPressed) {
    cursor(ARROW);
  }
}

function drawEndScreen() {
  // 先更新並繪製彩帶（在背景）
  if (confettiActive) {
    updateConfetti();
  }
  textSize(adaptiveTextSize(32));
  fill(0);
  text('測驗完成！', width/2, height * 0.15);
  
  textSize(adaptiveTextSize(24));
  text(`得分：${score}/3`, width/2, height * 0.25);
  
  // 根據分數顯示不同的回饋
  let feedback;
  if (score === 3) {
    feedback = random(feedbackMessages.excellent);
  } else if (score === 2) {
    feedback = random(feedbackMessages.good);
  } else {
    feedback = random(feedbackMessages.needsImprovement);
  }
  
  text(feedback, width/2, height * 0.35);
  
  // 顯示答案回顧
  let reviewSpacing = adaptiveSpacing(80);
  textSize(adaptiveTextSize(18));
  
  for (let i = 0; i < selectedQuestions.length; i++) {
    let y = height * 0.45 + i * reviewSpacing;
    let isCorrect = userAnswers[i] === selectedQuestions[i].correct;
    
    fill(isCorrect ? color(0, 255, 0) : color(255, 0, 0));
    text(isCorrect ? '✓' : '✗', width/2 - adaptiveSpacing(180), y);
    
    fill(0);
    text(selectedQuestions[i].question, width/2, y);
    textSize(adaptiveTextSize(16));
    text(`正確答案：${String.fromCharCode(65 + selectedQuestions[i].correct)}`, width/2, y + adaptiveSpacing(25));
    textSize(adaptiveTextSize(18));
  }
  
  // 繪製重新開始按鈕
  let buttonWidth = adaptiveSpacing(200);
  let buttonHeight = adaptiveSpacing(40);
  let buttonY = height * 0.85;
  let isHover = mouseX > width/2 - buttonWidth/2 && mouseX < width/2 + buttonWidth/2 &&
                mouseY > buttonY - buttonHeight/2 && mouseY < buttonY + buttonHeight/2;
  
  fill(isHover ? 220 : 255);
  rect(width/2 - buttonWidth/2, buttonY - buttonHeight/2, buttonWidth, buttonHeight, adaptiveSpacing(10));
  
  textSize(adaptiveTextSize(20));
  fill(0);
  text('重新開始測驗', width/2, buttonY);
  
  if (isHover) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function calculateScaling() {
  // 基於螢幕大小計算縮放因子
  baseFontSize = min(width, height) * 0.04;
  scaleFactor = min(width / 800, height / 600);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateScaling();
}

// 重置遊戲狀態
function resetGame() {
  currentQuestion = 0;
  score = 0;
  userAnswers = [];
  selectRandomQuestions(3);
  gameState = 'START';
  // 清除 confetti
  confettiParticles = [];
  confettiActive = false;
}

// 自適應文字大小函數
function adaptiveTextSize(size) {
  return size * scaleFactor;
}

// 自適應間距函數
function adaptiveSpacing(space) {
  return space * scaleFactor;
}

// ----- Confetti (彩帶) 實作 -----
class Confetti {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1) * scaleFactor * 2;
    this.vy = random(1, 4) * scaleFactor;
    this.size = random(6, 14) * scaleFactor;
    this.color = random(confettiColors);
    this.rotation = random(TWO_PI);
    this.angularVel = random(-0.1, 0.1);
    this.alive = true;
  }

  update() {
    // 模擬飄落與左右擺動
    this.vy += 0.05 * scaleFactor; // 重力
    this.x += this.vx + sin(frameCount * 0.02 + this.x) * 0.5 * scaleFactor;
    this.y += this.vy;
    this.rotation += this.angularVel;

    if (this.y - this.size > height) {
      this.alive = false;
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    noStroke();
    fill(this.color);
    // 畫長條狀的彩帶
    rectMode(CENTER);
    rect(0, 0, this.size * 0.6, this.size * 2, this.size * 0.2);
    pop();
  }
}

function spawnConfetti(count) {
  for (let i = 0; i < count; i++) {
    let x = random(0, width);
    let y = random(-height * 0.2, -5);
    confettiParticles.push(new Confetti(x, y));
  }
}

function updateConfetti() {
  // 更新並繪製現有彩帶
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    let p = confettiParticles[i];
    p.update();
    p.draw();
    if (!p.alive) {
      confettiParticles.splice(i, 1);
    }
  }

  // 如果持續活躍，持續從頂部產生少量彩帶（直到達到上限）
  if (confettiActive) {
    // 每幾幀產生一次以控制速率
    let spawnEvery = 3; // 每 3 幀產生
    if (frameCount % spawnEvery === 0) {
      let spawnCount = 4; // 每次產生的數量
      let canSpawn = confettiMaxParticles - confettiParticles.length;
      if (canSpawn > 0) {
        spawnConfetti(min(spawnCount, canSpawn));
      }
    }
  }
}


function mouseClicked() {
  switch(gameState) {
    case 'START':
      if (mouseY > height/2 - adaptiveSpacing(20) && mouseY < height/2 + adaptiveSpacing(20) &&
          mouseX > width/2 - adaptiveSpacing(100) && mouseX < width/2 + adaptiveSpacing(100)) {
        gameState = 'QUIZ';
      }
      break;
      
    case 'QUIZ':
      for (let i = 0; i < 4; i++) {
        let y = height * 0.3 + i * adaptiveSpacing(80);
        if (mouseX > width/2 - adaptiveSpacing(150) && mouseX < width/2 + adaptiveSpacing(150) &&
            mouseY > y - adaptiveSpacing(30) && mouseY < y + adaptiveSpacing(30)) {
          userAnswers[currentQuestion] = i;
          if (i === selectedQuestions[currentQuestion].correct) {
            score++;
          }
          currentQuestion++;
          if (currentQuestion >= selectedQuestions.length) {
            gameState = 'END';
            // 進入結束畫面時產生彩帶
            spawnConfetti(80);
            confettiActive = true;
          }
          break;
        }
      }
      break;
      
    case 'END':
      let buttonY = height * 0.85;
      let buttonWidth = adaptiveSpacing(200);
      let buttonHeight = adaptiveSpacing(40);
      if (mouseX > width/2 - buttonWidth/2 && mouseX < width/2 + buttonWidth/2 &&
          mouseY > buttonY - buttonHeight/2 && mouseY < buttonY + buttonHeight/2) {
        resetGame();
      }
      break;
  }
}
