const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove any duplicated quizError or joinStatus state declarations we accidentally injected
  code = code.replace(/^[ \t]*const \[joinStatus, setJoinStatus\] = useState<string \| null>\(null\);\n/gm, '');
  code = code.replace(/^[ \t]*const \[quizError, setQuizError\] = useState<string \| null>\(null\);\n/gm, '');
  
  // Also we might have broken activeTab
  // Let's ensure activeTab is there
  if (!code.includes('const [activeTab, setActiveTab] = useState<')) {
    code = code.replace(/const \[quote, setQuote\] = useState\([^)]+\);/g, `$&
  const [activeTab, setActiveTab] = useState<
    | "all_sets"
    | "ranking"
    | "quiz"
    | "settings"
    | "profile"
    | "create_deck"
    | "groups"
    | "vibe-classes"
  >((sessionStorage.getItem("student_dashboard_tab") as any) || "all_sets");
`);
  }

  // Insert joinStatus and quizError cleanly
  code = code.replace(/const \[quote, setQuote\] = useState\([^)]+\);/g, `$&
  const [joinStatus, setJoinStatus] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);`);

  fs.writeFileSync(file, code);
}

fixFile('src/pages/LegacyStudentDashboard.tsx');
fixFile('src/vibe-sandbox/VibeStudentDashboard.tsx');
