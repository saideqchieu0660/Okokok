const fs = require('fs');
const file = 'src/pages/StudyRoom.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add import
const importTarget = `import { VibeFlashcardActiveView } from "../vibe-sandbox/VibeFlashcardActiveView";`;
const importReplacement = `import { VibeFlashcardActiveView } from "../vibe-sandbox/VibeFlashcardActiveView";\nimport { VibeClassModal } from "../vibe-sandbox/VibeClassModal";`;

if (content.includes(importTarget)) {
  content = content.replace(importTarget, importReplacement);
}

// Add state
const stateTarget = `  const [isEditing, setIsEditing] = useState(false);`;
const stateReplacement = `  const [isClassModalOpen, setIsClassModalOpen] = useState(false);\n  const [isEditing, setIsEditing] = useState(false);`;

if (content.includes(stateTarget)) {
  content = content.replace(stateTarget, stateReplacement);
}

// Pass prop to VibeFlashcardActiveView
const vibeTarget = `      <VibeFlashcardActiveView
        currentCard={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        onMark={handleMark}
        onRemindLater={handleRemindLater}
        currentIndex={currentIndex}
        totalCards={studyQueue.length}
        deckTitle={deck?.title}
        onBack={handleBack}`;
const vibeReplacement = `      <VibeClassModal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} deckId={deck?.id || ""} />
      <VibeFlashcardActiveView
        currentCard={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        onMark={handleMark}
        onRemindLater={handleRemindLater}
        currentIndex={currentIndex}
        totalCards={studyQueue.length}
        deckTitle={deck?.title}
        onBack={handleBack}
        onAddToClass={() => setIsClassModalOpen(true)}`;

if (content.includes(vibeTarget)) {
  content = content.replace(vibeTarget, vibeReplacement);
}

fs.writeFileSync(file, content, 'utf8');
console.log("Patched StudyRoom.tsx");
