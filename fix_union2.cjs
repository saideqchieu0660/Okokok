const fs = require('fs');

function fix(file) {
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let newLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().match(/^\| "(ranking|quiz|mock_exam_setup|settings|profile|create_deck|groups|vibe-classes|all_sets)"/)) {
      continue;
    }
    if (lines[i].trim().match(/^>\(\(sessionStorage\.getItem\("student_dashboard_tab"\) as any\) \|\| "all_sets"\);/)) {
      continue;
    }
    newLines.push(lines[i]);
  }
  fs.writeFileSync(file, newLines.join('\n'));
}

fix('src/vibe-sandbox/VibeStudentDashboard.tsx');
fix('src/pages/LegacyStudentDashboard.tsx');
