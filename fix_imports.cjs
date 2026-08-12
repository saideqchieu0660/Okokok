const fs = require('fs');
let code = fs.readFileSync('src/components/DeckList.tsx', 'utf-8');

code = code.replace(/import { MoreVertical, MoreHorizontal, VibeStickyStudyNav, VibeNavGroup } from '\.\.\/vibe-sandbox\/VibeStickyStudyNav';/g, "import { VibeStickyStudyNav, VibeNavGroup } from '../vibe-sandbox/VibeStickyStudyNav';");
code = code.replace(/import { MoreVertical, MoreHorizontal, VibeClassModal } from '\.\.\/vibe-sandbox\/VibeClassModal';/g, "import { VibeClassModal } from '../vibe-sandbox/VibeClassModal';");
code = code.replace(/import { MoreVertical, MoreHorizontal, EditDeckModal } from '\.\/EditDeckModal';/g, "import { EditDeckModal } from './EditDeckModal';");

fs.writeFileSync('src/components/DeckList.tsx', code);
