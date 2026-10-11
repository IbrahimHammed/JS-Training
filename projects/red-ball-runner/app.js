const canvas = document.querySelector("#game-canvas");
const context = canvas.getContext("2d");
const overlay = document.querySelector("#game-overlay");
const playerForm = document.querySelector("#player-form");
const playerNameInput = document.querySelector("#player-name");
const speedLevelInput = document.querySelector("#speed-level");
const playButton = document.querySelector("#play-button");
const overlayTitle = document.querySelector("#overlay-title");
const overlayKicker = document.querySelector("#overlay-kicker");
const overlayCopy = document.querySelector("#overlay-copy");
const overlayIcon = document.querySelector("#overlay-icon");
const overlayError = document.querySelector("#overlay-error");
const gameStateLabel = document.querySelector("#game-state");
const liveDot = document.querySelector("#game-live-dot");
const scoreOutput = document.querySelector("#score-count");
const caughtOutput = document.querySelector("#caught-count");
const missedOutput = document.querySelector("#missed-count");
const leaderboardContent = document.querySelector("#leaderboard-content");

const GAME_WIDTH = 960;
const GAME_HEIGHT = 570;
const PLAYER_WIDTH = 112;
const PLAYER_HEIGHT = 17;
const PLAYER_BOTTOM = 31;
const PLAYER_SPEED = 470;
const BALL_RADIUS = 11;
const MISS_LIMIT = 5;
const LEADERBOARD_LIMIT = 10;
const SPEED_LEVELS = {
  slow: { label: "Slow", minimumFallSpeed: 95, fallSpeedRange: 40, spawnInterval: 1.7, spawnJitter: 0.45 },
  medium: { label: "Medium", minimumFallSpeed: 155, fallSpeedRange: 55, spawnInterval: 1.15, spawnJitter: 0.35 },
  fast: { label: "Fast", minimumFallSpeed: 225, fallSpeedRange: 75, spawnInterval: 0.78, spawnJitter: 0.28 },
};

const game = {
  state: "ready",
  playerName: "",
  speedLevel: "slow",
  playerX: (GAME_WIDTH - PLAYER_WIDTH) / 2,
  score: 0,
  caught: 0,
  missed: 0,
  balls: [],
  spawnTimer: 0,
  previousTime: 0,
  animationFrame: 0,
  keys: new Set(),
  touchDirection: 0,
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
drawGame();
loadLeaderboard();

playerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startGame(playerNameInput.value);
});

window.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  if (game.state !== "playing") return;
  event.preventDefault();
  game.keys.add(event.key);
});

window.addEventListener("keyup", (event) => game.keys.delete(event.key));
window.addEventListener("blur", () => {
  game.keys.clear();
  game.touchDirection = 0;
  document.querySelectorAll(".move-button").forEach((button) => button.classList.remove("is-pressed"));
});

bindMoveButton("#move-left", -1);
bindMoveButton("#move-right", 1);

function bindMoveButton(selector, direction) {
  const button = document.querySelector(selector);
  const stopMoving = (event) => {
    event.preventDefault();
    if (game.touchDirection === direction) game.touchDirection = 0;
    button.classList.remove("is-pressed");
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    if (game.state !== "playing") return;
    game.touchDirection = direction;
    button.classList.add("is-pressed");
    button.setPointerCapture(event.pointerId);
  });
  button.addEventListener("pointerup", stopMoving);
  button.addEventListener("pointercancel", stopMoving);
  button.addEventListener("lostpointercapture", stopMoving);
  button.addEventListener("contextmenu", (event) => event.preventDefault());
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * pixelRatio);
  canvas.height = Math.round(bounds.height * pixelRatio);
  context.setTransform(
    (bounds.width * pixelRatio) / GAME_WIDTH,
    0,
    0,
    (bounds.height * pixelRatio) / GAME_HEIGHT,
    0,
    0
  );
  drawGame();
}

function startGame(rawName) {
  const name = rawName.trim().replace(/\s+/g, " ");
  if (!name) {
    playerNameInput.setCustomValidity("Enter your name to play.");
    playerNameInput.reportValidity();
    return;
  }

  playerNameInput.setCustomValidity("");
  game.playerName = name.slice(0, 20);
  game.speedLevel = speedLevelInput.value;
  game.playerX = (GAME_WIDTH - PLAYER_WIDTH) / 2;
  game.score = 0;
  game.caught = 0;
  game.missed = 0;
  game.balls = [];
  game.spawnTimer = 0.8;
  game.previousTime = 0;
  game.keys.clear();
  game.touchDirection = 0;
  game.state = "playing";

  updateScoreboard();
  gameStateLabel.textContent = "GAME IN PROGRESS";
  liveDot.classList.add("is-live");
  liveDot.classList.remove("is-over");
  overlay.hidden = true;
  overlayError.hidden = true;
  playerForm.hidden = true;
  playButton.disabled = false;
  playButton.innerHTML = 'Play <span aria-hidden="true">↗</span>';

  cancelAnimationFrame(game.animationFrame);
  game.animationFrame = requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (game.state !== "playing") return;
  if (!game.previousTime) game.previousTime = timestamp;

  // Cap elapsed time to avoid a large jump after a background tab or paused frame.
  const delta = Math.min((timestamp - game.previousTime) / 1000, 0.04);
  game.previousTime = timestamp;

  updateGame(delta);
  drawGame();

  if (game.state === "playing") {
    game.animationFrame = requestAnimationFrame(gameLoop);
  }
}

function updateGame(delta) {
  const movingLeft = game.keys.has("ArrowLeft") || game.touchDirection < 0;
  const movingRight = game.keys.has("ArrowRight") || game.touchDirection > 0;
  const direction = Number(movingRight) - Number(movingLeft);

  game.playerX += direction * PLAYER_SPEED * delta;
  game.playerX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_WIDTH, game.playerX));

  game.spawnTimer -= delta;
  if (game.spawnTimer <= 0) {
    spawnBall();
    const speed = SPEED_LEVELS[game.speedLevel];
    game.spawnTimer = speed.spawnInterval + Math.random() * speed.spawnJitter;
  }

  const playerY = GAME_HEIGHT - PLAYER_BOTTOM - PLAYER_HEIGHT;
  for (let index = game.balls.length - 1; index >= 0; index--) {
    const ball = game.balls[index];
    ball.y += ball.speed * delta;

    const overlapsPlayer =
      ball.y + BALL_RADIUS >= playerY &&
      ball.y - BALL_RADIUS <= playerY + PLAYER_HEIGHT &&
      ball.x + BALL_RADIUS >= game.playerX &&
      ball.x - BALL_RADIUS <= game.playerX + PLAYER_WIDTH;

    if (overlapsPlayer && ball.speed > 0) {
      ball.speed = -1;
      game.caught += 1;
      game.score += 1;
      game.balls.splice(index, 1);
      updateScoreboard();
      continue;
    }

    if (ball.y - BALL_RADIUS > GAME_HEIGHT) {
      game.balls.splice(index, 1);
      game.missed += 1;
      updateScoreboard();
      if (game.missed >= MISS_LIMIT) {
        finishGame();
        return;
      }
    }
  }
}

function spawnBall() {
  const speed = SPEED_LEVELS[game.speedLevel];
  game.balls.push({
    x: BALL_RADIUS + 8 + Math.random() * (GAME_WIDTH - 2 * (BALL_RADIUS + 8)),
    y: -BALL_RADIUS,
    speed: speed.minimumFallSpeed + Math.random() * speed.fallSpeedRange,
    shine: 0.15 + Math.random() * 0.2,
  });
}

function drawGame() {
  context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  drawBackgroundDetails();
  game.balls.forEach(drawBall);
  drawPlayer();
}

function drawBackgroundDetails() {
  context.fillStyle = "#f3f5f7";
  for (let x = 28; x < GAME_WIDTH; x += 32) {
    for (let y = 28; y < GAME_HEIGHT; y += 32) {
      context.beginPath();
      context.arc(x, y, 1, 0, Math.PI * 2);
      context.fill();
    }
  }

  context.fillStyle = "#eef0f3";
  context.fillRect(24, GAME_HEIGHT - 20, GAME_WIDTH - 48, 1);
}

function drawBall(ball) {
  const gradient = context.createRadialGradient(
    ball.x - BALL_RADIUS * 0.33,
    ball.y - BALL_RADIUS * 0.4,
    1,
    ball.x,
    ball.y,
    BALL_RADIUS * 1.35
  );
  gradient.addColorStop(0, "#ff8c83");
  gradient.addColorStop(ball.shine, "#f3655e");
  gradient.addColorStop(1, "#d84142");

  context.save();
  context.shadowColor = "rgba(220, 65, 66, .22)";
  context.shadowBlur = 12;
  context.shadowOffsetY = 4;
  context.beginPath();
  context.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
  context.fillStyle = gradient;
  context.fill();
  context.restore();

  context.beginPath();
  context.arc(ball.x - BALL_RADIUS * 0.33, ball.y - BALL_RADIUS * 0.38, 2.1, 0, Math.PI * 2);
  context.fillStyle = "rgba(255, 255, 255, .78)";
  context.fill();
}

function drawPlayer() {
  const y = GAME_HEIGHT - PLAYER_BOTTOM - PLAYER_HEIGHT;
  context.save();
  context.shadowColor = "rgba(32, 39, 49, .17)";
  context.shadowBlur = 12;
  context.shadowOffsetY = 5;
  roundedRect(context, game.playerX, y, PLAYER_WIDTH, PLAYER_HEIGHT, 6);
  context.fillStyle = "#222a34";
  context.fill();
  context.restore();

  roundedRect(context, game.playerX + 38, y + 5, PLAYER_WIDTH - 76, 3, 2);
  context.fillStyle = "rgba(255,255,255,.34)";
  context.fill();
}

function roundedRect(target, x, y, width, height, radius) {
  target.beginPath();
  target.roundRect(x, y, width, height, radius);
}

function updateScoreboard() {
  scoreOutput.textContent = game.score;
  caughtOutput.textContent = game.caught;
  missedOutput.textContent = game.missed;
}

async function finishGame() {
  game.state = "over";
  game.keys.clear();
  game.touchDirection = 0;
  gameStateLabel.textContent = "GAME OVER";
  liveDot.classList.remove("is-live");
  liveDot.classList.add("is-over");
  overlay.hidden = false;
  playerForm.hidden = false;
  playButton.innerHTML = 'Play again <span aria-hidden="true">↗</span>';
  overlayIcon.textContent = game.score >= 10 ? "★" : "✦";
  overlayKicker.textContent = "RUN COMPLETE";
  overlayTitle.textContent = game.score > 0 ? `Nice catch, ${game.playerName}!` : `Good try, ${game.playerName}!`;
  overlayCopy.textContent = `Final score: ${game.caught} caught · ${game.missed} missed · ${SPEED_LEVELS[game.speedLevel].label} speed.`;
  overlayError.hidden = true;
  drawGame();

  playButton.disabled = true;
  try {
    await saveScore({
      name: game.playerName,
      score: game.caught,
      caught: game.caught,
      missed: game.missed,
      speedLevel: game.speedLevel,
    });
    await loadLeaderboard();
  } catch (error) {
    console.error("The finished game score could not be saved:", error);
    overlayError.textContent = "Your game ended, but the score could not be saved. Check that the local game server is running.";
    overlayError.hidden = false;
  } finally {
    playButton.disabled = false;
  }
}

async function loadLeaderboard() {
  try {
    const response = await fetch("/api/leaderboard");
    if (!response.ok) throw new Error(`Leaderboard request failed with status ${response.status}.`);
    const leaderboard = await response.json();
    renderLeaderboard(leaderboard);
  } catch (error) {
    console.error("Leaderboard could not be loaded:", error);
    leaderboardContent.replaceChildren();
    const message = document.createElement("p");
    message.className = "leaderboard-error";
    message.textContent = "Scores are unavailable. Please check that the local game server is running.";
    leaderboardContent.append(message);
  }
}

async function saveScore(score) {
  const response = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(score),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || `Saving the score failed with status ${response.status}.`);
  }
  return response.json();
}

function renderLeaderboard(scores) {
  leaderboardContent.replaceChildren();

  if (!scores.length) {
    const empty = document.createElement("div");
    empty.className = "leaderboard-empty";
    const trophy = document.createElement("span");
    trophy.className = "empty-cup";
    trophy.setAttribute("aria-hidden", "true");
    trophy.textContent = "♛";
    const heading = document.createElement("strong");
    heading.textContent = "Your spot is waiting.";
    const copy = document.createElement("span");
    copy.textContent = "Finish a game to claim a place on the leaderboard.";
    empty.append(trophy, heading, copy);
    leaderboardContent.append(empty);
    return;
  }

  scores.slice(0, LEADERBOARD_LIMIT).forEach((score, index) => {
    const row = document.createElement("div");
    row.className = "leader-row";

    const rank = document.createElement("span");
    rank.className = `rank-badge${index < 3 ? ` rank-${index + 1}` : ""}`;
    rank.textContent = String(index + 1).padStart(2, "0");
    rank.setAttribute(
      "aria-label",
      index === 0 ? "1st place, gold" : index === 1 ? "2nd place, silver" : index === 2 ? "3rd place, bronze" : `Place ${index + 1}`
    );

    const player = document.createElement("span");
    player.className = "leader-player";
    const name = document.createElement("strong");
    name.textContent = score.name;
    const date = document.createElement("small");
    const speedLabel = SPEED_LEVELS[score.speedLevel]?.label || "Classic";
    date.textContent = `${speedLabel} speed · ${formatDate(score.date)}`;
    player.append(name, date);

    const points = document.createElement("strong");
    points.className = "leader-score";
    const finalScore = Number.isSafeInteger(score.caught) ? score.caught : score.score;
    points.textContent = `+${finalScore}`;

    row.append(rank, player, points);
    leaderboardContent.append(row);
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just played";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}
