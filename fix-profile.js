import fs from 'fs';
let code = fs.readFileSync('src/pages/StudentDashboard.tsx', 'utf8');

code = code.replace(
  /<div\s+className=\{\s*activeTab === "profile"\s*\?\s*"hardware-tab-active w-full"\s*:\s*"hardware-tab-content w-full"\s*\}\s*>/,
  '{activeTab === "profile" && (\n        <div className="w-full">'
);

// We also need to add the closing parenthesis after the matching closing div for the profile tab.
// But it's hard to do cleanly without parsing. Let's just do it with a simple search.
// Profile tab ends with:
//         </motion.div>
//       </div>
//       {/* Cài đặt chung (Thiết kế cho tương lai, hiện tại dùng để demo) */}
let endIdx = code.indexOf('{/* Cài đặt chung (Thiết kế cho tương lai, hiện tại dùng để demo) */}');
if (endIdx > -1) {
  let sub = code.substring(0, endIdx);
  let lastDivIdx = sub.lastIndexOf('</div>');
  code = code.substring(0, lastDivIdx + 6) + '\n      )}' + code.substring(lastDivIdx + 6);
}

fs.writeFileSync('src/pages/StudentDashboard.tsx', code);
