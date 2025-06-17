const { spawn } = require('child_process');
const path = require('path');

console.log('🌸 Starting Kawaii Blog Development Server 🌸');
console.log('');

const nextBin = path.join(__dirname, 'node_modules', '.bin', 'next');
const child = spawn('node', [nextBin, 'dev'], {
  cwd: __dirname,
  stdio: 'inherit'
});

child.on('error', (err) => {
  console.error('Failed to start server:', err);
});

child.on('close', (code) => {
  console.log(`Server stopped with code ${code}`);
});