const fs = require('fs');
const file = 'src/vibe-sandbox/VibeClasses.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('  const activeClass = classes.find(c => c.id === activeClassId);\n', '');

fs.writeFileSync(file, content, 'utf8');
