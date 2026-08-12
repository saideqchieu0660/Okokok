const fs = require('fs');
const content = fs.readFileSync('src/components/DeckList.tsx', 'utf-8');

// Find the good mapping body inside subjectDecks.map
const goodStart = content.indexOf('return (', content.indexOf('subjectDecks.map('));
const goodEnd = content.indexOf('</TiltCard>', goodStart) + '</TiltCard>'.length;
const goodBody = content.substring(goodStart, goodEnd);

// Replace the bad mapping body inside sortedAndFilteredDecks.map
const map2Start = content.indexOf('sortedAndFilteredDecks.map(');
const badStart = content.indexOf('return (', map2Start);
const badEnd = content.indexOf('</TiltCard>', badStart) + '</TiltCard>'.length;

const newBody = goodBody.replace('isFeatureEnabled("vibe-study-nav") ? "w-full" : "w-[85vw] sm:w-[380px] snap-start"', '"w-full"');

const newContent = content.substring(0, badStart) + newBody + content.substring(badEnd);
fs.writeFileSync('src/components/DeckList.tsx', newContent);
