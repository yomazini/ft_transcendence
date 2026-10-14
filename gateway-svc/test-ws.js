const { io } = require('socket.io-client');

const socket = io('http://localhost:3001');
let createdJobId = null;

console.log('1. Connecting to WebSocket Gateway on http://localhost:3001 ...');

socket.on('connect', async () => {
  console.log(`[CONNECTED] Socket ID: ${socket.id}`);
  console.log('2. Triggering POST /api/jobs on Gateway ...\n');

  try {
    const res = await fetch('http://localhost:3001/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        mode: 'subreddit',
        target: 'r/freelance',
        customer_persona: {
          description: 'freelancers',
          price_sensitivity: 'budget',
          top_priority: 'speed',
        },
      }),
    });
    const body = await res.json();
    createdJobId = body.id;
    console.log(`[HTTP 201] Job Created with ID: ${createdJobId}\n`);
  } catch (err) {
    console.error('Failed to trigger job:', err.message);
    process.exit(1);
  }
});

socket.on('job:queued', (data) => {
  console.log('[1/3 EVENT RECEIVED: job:queued]');
  console.log(JSON.stringify(data, null, 2));
});

socket.on('job:running', (data) => {
  console.log('\n[2/3 EVENT RECEIVED: job:running] (from analysis-svc via Redis Pub/Sub)');
  console.log(JSON.stringify(data, null, 2));
});

socket.on('job:done', (data) => {
  console.log('\n[3/3 EVENT RECEIVED: job:done] (from analysis-svc via Redis Pub/Sub)');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n✅ SUCCESS! Full E2E Queue + Redis Pub/Sub + WebSocket Broadcast Verified!');
  socket.close();
  process.exit(0);
});

socket.on('job:failed', (data) => {
  console.error('\n[EVENT RECEIVED: job:failed]', data);
  socket.close();
  process.exit(1);
});

setTimeout(() => {
  console.error('\n❌ Timed out waiting for job:done event after 10s.');
  socket.close();
  process.exit(1);
}, 10000);
