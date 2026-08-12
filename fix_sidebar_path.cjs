const fs = require('fs');
let code = fs.readFileSync('src/vibe-sandbox/VibeSidebar.tsx', 'utf8');

// Replace any occurrence of item.path with (item as any).path
code = code.replace(/item\.path/g, '(item as any).path');

fs.writeFileSync('src/vibe-sandbox/VibeSidebar.tsx', code);
