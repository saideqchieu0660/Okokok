const fs = require('fs');
const file = 'src/vibe-sandbox/VibeClasses.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { StickyNav }')) {
  content = content.replace(
    'import { store, Deck } from "../lib/store";',
    'import { store, Deck } from "../lib/store";\nimport { StickyNav } from "../components/StickyNav";'
  );
}

// We will change how classes are rendered.
const stateTarget = `  const [classes, setClasses] = useState<VibeClass[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);`;
const stateReplacement = `  const [classes, setClasses] = useState<VibeClass[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = document.querySelectorAll('[data-section-id]');
      let currentSectionId: string | null = null;
      for (const el of sectionElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150) {
          currentSectionId = el.getAttribute('data-section-id');
        }
      }
      if (currentSectionId && currentSectionId !== activeSectionId) {
        setActiveSectionId(currentSectionId);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSectionId]);

  const handleSectionClick = (classId: string) => {
    setActiveSectionId(classId);
    const el = document.getElementById(\`section-\${classId}\`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleItemClick = (classId: string, deckId: string) => {
    const el = document.getElementById(\`deck-\${classId}-\${deckId}\`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };`;

content = content.replace(stateTarget, stateReplacement);

// We need to replace the rendering part.
// Find the exact render part:
const renderTarget = `      {!activeClassId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
// Wait, actually I will just write a custom script to replace everything below {isCreating && ( ... )}

fs.writeFileSync('temp.txt', content);
