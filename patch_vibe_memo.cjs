const fs = require('fs');
const file = 'src/vibe-sandbox/VibeFlashcardActiveView.tsx';
let content = fs.readFileSync(file, 'utf8');
if (!content.includes('React.memo(')) {
  content = content.replace(
    'export const VibeFlashcardActiveView: React.FC<VibeFlashcardActiveViewProps> = ({',
    'export const VibeFlashcardActiveView: React.FC<VibeFlashcardActiveViewProps> = React.memo(({'
  );
  content = content.substring(0, content.lastIndexOf('};')) + '}));\n';
  fs.writeFileSync(file, content);
}
