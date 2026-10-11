const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT) || 3001;
const ROOT = __dirname;
const SCORE_FILE = path.join(ROOT, "data", "scores.json");
const MAX_REQUEST_BYTES = 4096;
const LEADERBOARD_LIMIT = 10;
const SPEED_LEVELS = new Set(["slow", "medium", "fast"]);
let scoreWriteQueue = Promise.resolve();

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = http.createServer(async (request, response) => {
  let pathname;
  try {
    pathname = new URL(request.url, `http://${HOST}:${PORT}`).pathname;
  } catch {
    sendJson(response, 400, { error: "Invalid request URL." });
    return;
  }

  if (request.method === "GET" && pathname === "/api/leaderboard") {
    try {
      const scores = await readScores();
      sendJson(response, 200, rankScores(scores).slice(0, LEADERBOARD_LIMIT));
    } catch (error) {
      console.error("Could not read saved scores:", error);
      sendJson(response, 500, { error: "Saved scores could not be read." });
    }
    return;
  }

  if (request.method === "POST" && pathname === "/api/scores") {
    try {
      const score = await readScoreRequest(request);
      const leaderboard = await appendScore(score);
      sendJson(response, 201, { saved: true, leaderboard });
    } catch (error) {
      if (error instanceof RequestError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error("Could not save score:", error);
      sendJson(response, 500, { error: "The score could not be saved." });
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  serveStaticFile(pathname, response, request.method === "HEAD");
});

async function readScores() {
  try {
    const content = await fs.promises.readFile(SCORE_FILE, "utf8");
    const scores = JSON.parse(content);
    if (!Array.isArray(scores)) throw new Error("Score file must contain a JSON array.");
    return scores;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeScores(scores) {
  await fs.promises.mkdir(path.dirname(SCORE_FILE), { recursive: true });
  const temporaryFile = `${SCORE_FILE}.${process.pid}.tmp`;
  await fs.promises.writeFile(temporaryFile, `${JSON.stringify(scores, null, 2)}\n`, "utf8");
  await fs.promises.rename(temporaryFile, SCORE_FILE);
}

function appendScore(score) {
  const save = scoreWriteQueue.then(async () => {
    const scores = await readScores();
    scores.push({
      ...score,
      id: randomUUID(),
      date: new Date().toISOString(),
    });
    await writeScores(scores);
    return rankScores(scores).slice(0, LEADERBOARD_LIMIT);
  });

  // A failed write is reported to its caller but must not permanently block
  // later score submissions from reaching the serialized queue.
  scoreWriteQueue = save.catch(() => {});
  return save;
}

function rankScores(scores) {
  return scores
    .map((score) => ({
      ...score,
      score: scoreForRanking(score),
      speedLevel: SPEED_LEVELS.has(score.speedLevel) ? score.speedLevel : "classic",
    }))
    .sort(
      (left, right) =>
        scoreForRanking(right) - scoreForRanking(left) ||
        right.caught - left.caught ||
        new Date(left.date) - new Date(right.date)
    );
}

function scoreForRanking(score) {
  // Older saved runs used caught-minus-missed. Rank them by catches so the
  // leaderboard follows the current scoring rule without discarding history.
  return Number.isSafeInteger(score.caught) ? score.caught : score.score;
}

function readScoreRequest(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let tooLarge = false;
    request.on("data", (chunk) => {
      if (tooLarge) return;
      body += chunk;
      if (Buffer.byteLength(body) > MAX_REQUEST_BYTES) {
        tooLarge = true;
        body = "";
      }
    });
    request.on("error", reject);
    request.on("end", () => {
      if (tooLarge) {
        reject(new RequestError(413, "Score submission is too large."));
        return;
      }
      let submitted;
      try {
        submitted = JSON.parse(body);
      } catch {
        reject(new RequestError(400, "Score submission must be valid JSON."));
        return;
      }
      if (!submitted || typeof submitted !== "object" || Array.isArray(submitted)) {
        reject(new RequestError(400, "Score submission must be a JSON object."));
        return;
      }

      const name = typeof submitted.name === "string" ? submitted.name.trim().replace(/\s+/g, " ") : "";
      if (!name || name.length > 20) {
        reject(new RequestError(400, "Player name must contain 1 to 20 characters."));
        return;
      }
      if (
        !Number.isSafeInteger(submitted.score) ||
        !Number.isSafeInteger(submitted.caught) ||
        !Number.isSafeInteger(submitted.missed) ||
        !SPEED_LEVELS.has(submitted.speedLevel) ||
        submitted.caught < 0 ||
        submitted.missed !== 5 ||
        submitted.score !== submitted.caught
      ) {
        reject(new RequestError(400, "The submitted game score is invalid."));
        return;
      }

      resolve({
        name,
        score: submitted.score,
        caught: submitted.caught,
        missed: submitted.missed,
        speedLevel: submitted.speedLevel,
      });
    });
  });
}

function serveStaticFile(pathname, response, isHeadRequest) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.resolve(ROOT, `.${requestedPath}`);
  const relativePath = path.relative(ROOT, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      const status = error.code === "ENOENT" ? 404 : 500;
      if (status === 500) console.error(`Could not read ${filePath}:`, error);
      response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(isHeadRequest ? undefined : status === 404 ? "Not found" : "Server error");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(isHeadRequest ? undefined : content);
  });
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(data));
}

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

server.listen(PORT, HOST, () => {
  console.log(`Red Ball Run is available at http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
  console.error("The Red Ball Run server could not start:", error);
  process.exitCode = 1;
});
