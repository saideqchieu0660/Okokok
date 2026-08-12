import fs from 'fs';
let code = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

const regex = /<div\s+className=\{\s*activeTab === "([^"]+)"\s*\?\s*"hardware-tab-active w-full"\s*:\s*"hardware-tab-content w-full"\s*\}\s*>/g;

let matches = [...code.matchAll(regex)];
matches.reverse();

for (const match of matches) {
  const tabName = match[1];
  const startIdx = match.index;
  const matchLength = match[0].length;
  
  let depth = 1;
  let endIdx = startIdx + matchLength;
  
  while(endIdx < code.length) {
    if (code.startsWith('<div', endIdx) || code.startsWith('<motion.div', endIdx)) {
      depth++;
      endIdx += code.startsWith('<motion.div', endIdx) ? 11 : 4;
      continue;
    } else if (code.startsWith('</div', endIdx) || code.startsWith('</motion.div', endIdx)) {
      depth--;
      if (depth === 0) {
        break;
      }
      endIdx += code.startsWith('</motion.div', endIdx) ? 13 : 6;
      continue;
    }
    endIdx++;
  }
  
  if (depth === 0) {
    let isMotion = code.startsWith('</motion.div', endIdx);
    let closingLen = isMotion ? 13 : 6;
    code = code.slice(0, endIdx) + '</' + (isMotion ? 'motion.div' : 'div') + '>\n      )}' + code.slice(endIdx + closingLen);
    code = code.slice(0, startIdx) + `{activeTab === "${tabName}" && (\n        <div className="w-full">` + code.slice(startIdx + matchLength);
  }
}

fs.writeFileSync('src/pages/StudentDashboard.tsx', code);
