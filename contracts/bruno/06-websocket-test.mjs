import { createRequire } from "node:module";

const require = createRequire(
  new URL("../../frontend/package.json", import.meta.url),
);
const { io } = require("socket.io-client");

const base = (process.env.BASE_URL || "https://localhost:8080").replace(
  /\/$/,
  "",
);
const token = process.env.TOKEN;

if (!token) {
  console.error("Set TOKEN to a valid JWT. Run 21-Auth-Login first.");
  process.exit(1);
}

const target = `ws-test-${Date.now()}`;
const events = [];
let jobId = null;
let finished = false;

const socket = io(base, {
  auth: { token },
  transports: ["websocket"],
  reconnection: false,
  rejectUnauthorized: false,
});

function finish(code, message) {
  if (finished) return;
  finished = true;
  console.log(message);
  socket.disconnect();
  process.exit(code);
}

const timer = setTimeout(() => {
  finish(1, "TIMEOUT: no job event for the test job");
}, 20000);

async function cleanup() {
  const response = await fetch(`${base}/api/jobs/${jobId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  finish(
    response.status === 204 ? 0 : 2,
    `cleanup ${response.status} for ${jobId}`,
  );
}

function handle(name, data) {
  if (finished || !data?.job_id) return;
  events.push({ name, data });
  console.log("event", name, JSON.stringify(data));
  if (jobId && data.job_id === jobId) {
    cleanup();
  }
}

for (const name of [
  "job:queued",
  "job:running",
  "job:done",
  "job:failed",
  "job:update",
]) {
  socket.on(name, (data) => handle(name, data));
}

socket.on("connect", async () => {
  console.log("connected", socket.id);
  // Wait for the server to verify the token and join the org room.
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const response = await fetch(`${base}/api/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode: "keyword", target }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    finish(1, `create failed ${response.status} ${JSON.stringify(body)}`);
    return;
  }

  jobId = body.id;
  console.log("created", jobId, body.name);
  const seen = events.find((event) => event.data.job_id === jobId);
  if (seen) {
    console.log("event already buffered", seen.name);
    cleanup();
  }
});

socket.on("connect_error", (error) => {
  finish(1, `connect_error ${error.message}`);
});

socket.on("disconnect", (reason) => {
  if (!finished) {
    console.log("disconnected", reason);
  }
});
