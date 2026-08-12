const fs = require('fs');
const content = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('return prev;'));
if (start > -1) {
  console.log(lines.slice(start - 5, start + 10).join('\n'));
}
