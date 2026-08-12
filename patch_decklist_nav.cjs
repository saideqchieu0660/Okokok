const fs = require('fs');
const file = 'src/components/DeckList.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import StickyNav
if (!content.includes('import { StickyNav }')) {
  content = content.replace(
    'import { TiltCard } from "./InteractiveTutorial";',
    'import { TiltCard } from "./InteractiveTutorial";\nimport { StickyNav } from "./StickyNav";'
  );
}

// 2. Add state and ref for scroll spy
const stateTarget = `  const { isOfflineUnavailable } = useSystemConfig();`;
const stateReplacement = `  const { isOfflineUnavailable } = useSystemConfig();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (!groupBySubject) return;
    
    const handleScroll = () => {
      const sectionElements = document.querySelectorAll('[data-section-id]');
      let currentSectionId: string | null = null;
      
      for (const el of sectionElements) {
        const rect = el.getBoundingClientRect();
        // If the top of the element is near the top of the viewport
        if (rect.top <= 150) {
          currentSectionId = el.getAttribute('data-section-id');
        }
      }
      
      if (currentSectionId && currentSectionId !== activeSectionId) {
        setActiveSectionId(currentSectionId);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [groupBySubject, activeSectionId]);

  const handleSectionClick = (subject: string) => {
    setActiveSectionId(subject);
    const el = document.getElementById(\`section-\${subject}\`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleItemClick = (subject: string, deckId: string) => {
    const el = document.getElementById(\`deck-\${deckId}\`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
}

// 3. Insert StickyNav if groupBySubject is true
const renderTarget = `        {sortedAndFilteredDecks.length > 0 ? (
          groupBySubject ? (
            <div className="space-y-16">`;
            
const renderReplacement = `        {sortedAndFilteredDecks.length > 0 ? (
          groupBySubject ? (
            <div className="space-y-16">
              <StickyNav 
                sections={Object.entries(groupedDecks).sort(([subjectA], [subjectB]) => {
                  if (subjectA === "📌 ĐÃ GHIM") return -1;
                  if (subjectB === "📌 ĐÃ GHIM") return 1;
                  return subjectA.localeCompare(subjectB, 'vi', { numeric: true });
                }).map(([subject, subjectDecks]) => ({
                  id: subject,
                  title: subject,
                  items: subjectDecks.map(d => ({ id: d.id, title: d.title }))
                }))}
                activeSectionId={activeSectionId}
                onSectionClick={handleSectionClick}
                onItemClick={handleItemClick}
              />`;
              
if (content.includes(renderTarget)) {
  content = content.replace(renderTarget, renderReplacement);
}

// 4. Add data attributes and IDs to sections and cards
const sectionTarget = `<div key={subject} className="space-y-8 animate-in fade-in duration-300">`;
const sectionReplacement = `<div key={subject} id={\`section-\${subject}\`} data-section-id={subject} className="space-y-8 animate-in fade-in duration-300">`;
content = content.split(sectionTarget).join(sectionReplacement);

const cardTarget = `<TiltCard key={\`\${deck.id || "deck"}-\${idx}\`} delayIdx={idx} className={cn("", isOfflineUnavailable && "opacity-40 grayscale pointer-events-none")}>`;
const cardReplacement = `<div id={\`deck-\${deck.id}\`} className="h-full"><TiltCard key={\`\${deck.id || "deck"}-\${idx}\`} delayIdx={idx} className={cn("", isOfflineUnavailable && "opacity-40 grayscale pointer-events-none")}>`;
content = content.split(cardTarget).join(cardReplacement);

const cardEndTarget = `</TiltCard>
                );`;
const cardEndReplacement = `</TiltCard></div>
                );`;
content = content.split(cardEndTarget).join(cardEndReplacement);

fs.writeFileSync(file, content, 'utf8');
