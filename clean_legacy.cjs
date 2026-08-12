const fs = require('fs');
let code = fs.readFileSync('src/pages/LegacyStudyRoom.tsx', 'utf8');

const vibeReturnIndex = code.indexOf('if (isFeatureEnabled("vibe-flashcard-learning")) {');
if (vibeReturnIndex !== -1) {
  const endOfVibeReturn = code.indexOf('  return (', vibeReturnIndex + 1);
  code = code.substring(0, vibeReturnIndex) + code.substring(endOfVibeReturn);
}

fs.writeFileSync('src/pages/LegacyStudyRoom.tsx', code);
