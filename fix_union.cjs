const fs = require('fs');
let code = fs.readFileSync('src/vibe-sandbox/VibeStudentDashboard.tsx', 'utf8');
code = code.replace(/^[ \t]*\| "ranking"\n^[ \t]*\| "quiz"\n^[ \t]*\| "mock_exam_setup"\n^[ \t]*\| "settings"\n^[ \t]*\| "profile"\n^[ \t]*\| "create_deck"\n^[ \t]*\| "groups"\n^[ \t]*\| "vibe-classes"\n^[ \t]*>\(\(sessionStorage\.getItem\("student_dashboard_tab"\) as any\) \|\| "all_sets"\);\n/gm, '');
fs.writeFileSync('src/vibe-sandbox/VibeStudentDashboard.tsx', code);

code = fs.readFileSync('src/pages/LegacyStudentDashboard.tsx', 'utf8');
code = code.replace(/^[ \t]*\| "ranking"\n^[ \t]*\| "quiz"\n^[ \t]*\| "mock_exam_setup"\n^[ \t]*\| "settings"\n^[ \t]*\| "profile"\n^[ \t]*\| "create_deck"\n^[ \t]*\| "groups"\n^[ \t]*\| "vibe-classes"\n^[ \t]*>\(\(sessionStorage\.getItem\("student_dashboard_tab"\) as any\) \|\| "all_sets"\);\n/gm, '');
fs.writeFileSync('src/pages/LegacyStudentDashboard.tsx', code);

