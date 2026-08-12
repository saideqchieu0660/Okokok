const fs = require('fs');
let code = fs.readFileSync('src/vibe-sandbox/VibeStudyRoomCore.tsx', 'utf8');

// Replace component name
code = code.replace(/export default function LegacyStudyRoom\(\) \{/, 'export default function VibeStudyRoomCore() {');

// Remove Pomodoro timer state and effect
code = code.replace(/const \[timerSeconds, setTimerSeconds\] = useState[^\n]+;/g, '');
code = code.replace(/const \[isTimerRunning, setIsTimerRunning\] = useState[^\n]+;/g, '');
code = code.replace(/const \[isTimerFinished, setIsTimerFinished\] = useState[^\n]+;/g, '');
code = code.replace(/const POMODORO_MINS = 25;/g, '');

// Remove timer effect
code = code.replace(/useEffect\(\(\) => \{\n\s+let interval: any;\n\s+if \(isTimerRunning[^]+?clearInterval\(interval\);\n\s+\}, \[isTimerRunning, timerSeconds\]\);/g, '');

code = code.replace(/const toggleTimer = \(\) => \{[^]+?};\n/g, '');
code = code.replace(/const formatTime = \(secs: number\) => \{[^]+?};\n/g, '');

// The old return block is massive. Let's just replace it.
// The code has:
//   if (isFeatureEnabled("vibe-flashcard-learning")) {
//     return ( ... );
//   }
//   return ( <div className="max-w-6xl ... legacy view ... );

const vibeReturnIndex = code.indexOf('if (isFeatureEnabled("vibe-flashcard-learning")) {');
if (vibeReturnIndex !== -1) {
  const startOfVibe = code.indexOf('return (', vibeReturnIndex);
  
  // We can just find the closing brace for the `if` and remove everything after it up to the end of the component.
  // Instead of complex regex, let's just do simple string manipulation.
  
  const endOfComponent = code.lastIndexOf('}');
  
  let newReturn = `
  return (
    <>
      <VibeClassModal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} deckIds={[deck?.id || ""]} />
      <EditDeckModal
        isOpen={isEditDeckModalOpen}
        onClose={() => setIsEditDeckModalOpen(false)}
        deckId={deck?.id || ""}
        initialTitle={typeof deck?.title === "string" ? deck.title : JSON.stringify(deck?.title || "")}
        initialSubject={typeof deck?.subject === "string" ? deck.subject : (deck?.subject ? JSON.stringify(deck.subject) : "general")}
        onSaveSuccess={() => {}}
      />
      <VibeFlashcardActiveView
        currentCard={currentCard}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        onMark={handleMark}
        onRemindLater={handleRemindLater}
        currentIndex={currentIndex}
        totalCards={studyQueue.length}
        deckTitle={typeof deck?.title === "string" ? deck.title : JSON.stringify(deck?.title || "")}
        onBack={handleBack}
        onAddToClass={() => setIsClassModalOpen(true)}
        onEditDeckMetadata={canEditDeck ? () => setIsEditDeckModalOpen(true) : undefined}
        isSoundEnabled={isSoundEnabled}
        onToggleMute={handleToggleMute}
        onListen={handleListen}
        isExtracting={isExtracting}
        deepExplanation={deepExplanation}
        onAgent3={handleAgent3}
        onClearExplanation={() => { 
           if (!isPinned) setDeepExplanation(null); 
           else setIsMinimized(true); 
        }}
        isClozeMode={isClozeMode}
        onToggleClozeMode={() => {
          const newMode = !isClozeMode;
          setIsClozeMode(newMode);
          localStorage.setItem("study_cloze_mode", String(newMode));
        }}
        isHintRevealed={isHintRevealed}
        onToggleHint={() => setIsHintRevealed(true)}
        canEditDeck={canEditCurrentCard}
        onEditOpen={handleEditOpen}
        isEditing={isEditing}
        editFront={editFront}
        setEditFront={setEditFront}
        editBack={editBack}
        setEditBack={setEditBack}
        editExampleSentence={editExampleSentence}
        setEditExampleSentence={setEditExampleSentence}
        onSaveEdit={handleSaveEdit}
        onSaveFormattedCard={handleSaveFormattedCard}
        onDeleteCard={(e) => {
          e.stopPropagation();
          executeActiveCardDeletion();
        }}
        deleteCountdown={deleteCountdown}
        startDeleteCountdown={startDeleteCountdown}
        cancelDeleteCountdown={cancelDeleteCountdown}
        detectLanguage={detectLanguage}
      />
    </>
  );
}
`;
  
  code = code.substring(0, vibeReturnIndex) + newReturn;
}

fs.writeFileSync('src/vibe-sandbox/VibeStudyRoomCore.tsx', code);
