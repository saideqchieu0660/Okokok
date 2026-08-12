const fs = require('fs');

function fixActiveTab(file) {
  let content = fs.readFileSync(file, 'utf8');
  // First, completely remove the mangled activeTab declaration and | "shop" etc.
  // We'll replace it near `const [activeLoreItem, setActiveLoreItem] = useState<string | null>(null);`
  
  content = content.replace(/^[ \t]*\| "shop"\n^[ \t]*>\(\(\) => \{\n^[ \t]*return \(sessionStorage\.getItem\("student_dashboard_tab"\) as any\) \|\| "all_sets";\n^[ \t]*\}\);\n/gm, '');

  if (!content.includes('const [activeTab, setActiveTab] = useState<')) {
    content = content.replace(
      /const \[activeLoreItem, setActiveLoreItem\] = useState<string \| null>\(null\);/,
      `const [activeLoreItem, setActiveLoreItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    | "all_sets"
    | "ranking"
    | "quiz"
    | "mock_exam_setup"
    | "settings"
    | "profile"
    | "create_deck"
    | "groups"
    | "vibe-classes"
    | "shop"
  >(() => (sessionStorage.getItem("student_dashboard_tab") as any) || "all_sets");
  const [joinStatus, setJoinStatus] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);`
    );
  }

  fs.writeFileSync(file, content);
}

fixActiveTab('src/vibe-sandbox/VibeStudentDashboard.tsx');
fixActiveTab('src/pages/LegacyStudentDashboard.tsx');
