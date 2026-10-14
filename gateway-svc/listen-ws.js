const { io } = require('socket.io-client');

const socket = io('http://localhost:3001');

console.log('📡 [WebSocket Monitor] Connecting to http://localhost:3001 ...');

socket.on('connect', () => {
  console.log(`✅ [CONNECTED] Socket ID: ${socket.id}`);
  console.log('👀 Waiting for live events (click "02 Create Job" in Bruno)...\n');
});

for (const evt of ['job:queued', 'job:running', 'job:done', 'job:failed']) {
  socket.on(evt, (data) => {
    console.log(`🔥 [EVENT: ${evt}] at ${new Date().toLocaleTimeString()}`);
    console.log(JSON.stringify(data, null, 2));
    console.log('----------------------------------------------------');
  });
}

socket.on('connect_error', (err) => {
  console.error('❌ [CONNECTION ERROR]:', err.message);
});
