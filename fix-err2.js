import fs from 'fs';
let code = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

// I inserted ")}" right after the last </div> before "Cài đặt chung"
let idx = code.indexOf('Cài đặt chung');
if (idx > -1) {
  let sub = code.substring(0, idx);
  // find the closest ")}" before idx
  let closeIdx = sub.lastIndexOf(')}');
  if (closeIdx > -1) {
    code = code.substring(0, closeIdx) + code.substring(closeIdx + 2);
  }
}

// revert the start tag
code = code.replace('{activeTab === "profile" && (\n        <div className="w-full">', '<div\n        className={\n          activeTab === "profile"\n            ? "hardware-tab-active w-full"\n            : "hardware-tab-content w-full"\n        }\n      >');

fs.writeFileSync('src/pages/StudentDashboard.tsx', code);
