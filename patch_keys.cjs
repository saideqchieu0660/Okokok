const fs = require('fs');
const file = 'src/components/DeckList.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = '<div id={`deck-${deck.id}`} className="h-full"><TiltCard key={`${deck.id || "deck"}-${idx}`} delayIdx={idx}';
const replacement = '<div id={`deck-${deck.id}`} className="h-full" key={`${deck.id || "deck"}-${idx}`}><TiltCard delayIdx={idx}';

content = content.replace(target, replacement);

fs.writeFileSync(file, content, 'utf8');
