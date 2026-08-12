const fs = require('fs');
let code = fs.readFileSync('src/pages/LegacyStudyRoom.tsx', 'utf8');
let stack = [];
for (let i = 0; i < code.length; i++) {
  if (code[i] === '{' || code[i] === '(' || code[i] === '<') stack.push({ char: code[i], pos: i });
  if (code[i] === '}' || code[i] === ')' || code[i] === '>') {
    const last = stack[stack.length - 1];
    if (code[i] === '}' && last.char === '{') stack.pop();
    else if (code[i] === ')' && last.char === '(') stack.pop();
    else if (code[i] === '>' && last.char === '<') stack.pop();
    // this is too naive for jsx
  }
}
