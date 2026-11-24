const firebaseConfig = {
  apiKey: "AIzaSyD9ICgmgybWy3o8WWQz-xAZ3woX3ia1hgQ",
  authDomain: "flower03-351a0.firebaseapp.com",
  databaseURL: "https://flower03-351a0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "flower03-351a0",
  storageBucket: "flower03-351a0.firebasestorage.app",
  messagingSenderId: "431405094210",
  appId: "1:431405094210:web:71ad63ad5aaef9aca764db"
};   // 1단계에서 복사한 내용
firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// 화면을 클릭할 때마다 꽃이 4단계로 자라고,
// 5번째 클릭에서 처음(빈 화면)으로 돌아갑니다.
//
// 단계: 0 = 시작 전, 1 = 씨앗, 2 = 줄기, 3 = 잎, 4 = 꽃

let stage = 0;

// 화면에 실제로 그려지는 크기입니다.
// 클릭하면 "목표 크기"가 바뀌고, 이 값들이 목표를 향해 조금씩 따라갑니다.
let seedSize = 0;   // 씨앗 크기 (0~1)
let stemHeight = 0; // 줄기 길이 (픽셀)
let leafSize = 0;   // 잎 크기 (0~1)
let petalSize = 0;  // 꽃잎 크기 (0~1)

// 단계별 줄기 길이: 시작 전, 씨앗, 줄기, 잎, 꽃
const STEM_HEIGHTS = [0, 0, 90, 170, 230];

// 자라는 속도: 숫자가 작을수록 천천히 자랍니다. (0.01 ~ 0.3 사이로 바꿔 보세요)
const GROW_SPEED = 0.08;

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeCap(ROUND);
}

function draw() {
  background(238, 238, 230);

  // 1) 현재 단계에서 도달해야 하는 목표 크기를 정합니다.
  let targetSeed = 0;
  let targetLeaf = 0;
  let targetPetal = 0;
  if (stage >= 1) targetSeed = 1;
  if (stage >= 3) targetLeaf = 1;
  if (stage >= 4) targetPetal = 1;
  const targetStem = STEM_HEIGHTS[stage];

  // 2) 현재 크기를 목표 크기 쪽으로 조금씩 이동시킵니다. (부드러운 움직임)
  seedSize = lerp(seedSize, targetSeed, GROW_SPEED);
  stemHeight = lerp(stemHeight, targetStem, GROW_SPEED);
  leafSize = lerp(leafSize, targetLeaf, GROW_SPEED);
  petalSize = lerp(petalSize, targetPetal, GROW_SPEED);

  // 3) 꽃을 그립니다. 기준점(0, 0)은 꽃이 땅에 닿는 자리입니다.
  push();
  translate(width / 2, height * 0.8);
  scale(min(width, height) / 500); // 화면 크기에 맞춰 전체 크기 조절

  // 땅
  stroke(120, 100, 80);
  strokeWeight(4);
  line(-150, 0, 150, 0);

  // 줄기 (2단계부터)
  if (stemHeight > 1) {
    stroke(70, 140, 80);
    strokeWeight(10);
    line(0, 0, 0, -stemHeight);
  }

  // 잎 (3단계부터)
  if (leafSize > 0.01) {
    noStroke();
    fill(90, 170, 100);
    const leafY = -stemHeight * 0.45;

    // 왼쪽 잎
    push();
    translate(0, leafY);
    rotate(-0.5);
    ellipse(-35 * leafSize, 0, 70 * leafSize, 26 * leafSize);
    pop();

    // 오른쪽 잎
    push();
    translate(0, leafY);
    rotate(0.5);
    ellipse(35 * leafSize, 0, 70 * leafSize, 26 * leafSize);
    pop();
  }

  // 꽃 (4단계)
  if (petalSize > 0.01) {
    push();
    translate(0, -stemHeight);

    // 꽃잎 6장을 원 모양으로 돌려가며 그립니다.
    noStroke();
    fill(245, 130, 160);
    for (let i = 0; i < 6; i++) {
      push();
      rotate((TWO_PI / 6) * i);
      ellipse(0, -38 * petalSize, 40 * petalSize, 60 * petalSize);
      pop();
    }

    // 꽃 가운데
    fill(250, 200, 70);
    circle(0, 0, 44 * petalSize);
    pop();
  }

  // 씨앗 (1단계부터) - 마지막에 그려서 줄기 아래쪽을 덮습니다.
  if (seedSize > 0.01) {
    noStroke();
    fill(90, 60, 40);
    ellipse(0, 0, 30 * seedSize, 20 * seedSize);
  }

  pop();
}

// 클릭(또는 터치)할 때마다 다음 단계로 넘어갑니다.
// 0 → 1 → 2 → 3 → 4 → (5번째 클릭) 0 으로 되돌아갑니다.
function grow() {
  stage = stage + 1;
  if (stage > 4) {
    stage = 0;
  }
}

function mousePressed() {
  grow();   // 마우스 테스트용
}


// 창 크기가 바뀌면 캔버스 크기도 맞춥니다.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

let lastClicks = null;

db.ref("flower/clicks").on("value", (snap) => {
  const clicks = snap.val() || 0;
  if (lastClicks !== null && clicks > lastClicks) {
    grow();
  }
  lastClicks = clicks;
});
let sliderValue = 0;
let sliderReady = false;

db.ref("flower/slider").on("value", (snap) => {
  if (sliderReady && snap.val() !== null) {
    sliderValue = snap.val();
    stage = constrain(floor(sliderValue / 20), 0, 4);
  }
  sliderReady = true;
});
