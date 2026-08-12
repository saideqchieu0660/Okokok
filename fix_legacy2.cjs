const fs = require('fs');
let code = fs.readFileSync('src/pages/LegacyStudyRoom.tsx', 'utf8');

// The block I want to remove starts at `return (` which is right after `Quay lại bộ đầy đủ </button> </div> );`
const marker = 'Quay lại bộ đầy đủ\n        </button>\n      </div>\n    );\n';
const markerIndex = code.indexOf(marker);
if (markerIndex !== -1) {
  const endOfLegacyReturn = code.indexOf('  return (', markerIndex + marker.length);
  code = code.substring(0, markerIndex + marker.length) + '\n' + code.substring(endOfLegacyReturn);
}

// Remove the extra `}` at the end of the file if I accidentally kept one.
// Actually, since I'm cleanly cutting out the bad block, the brackets should balance!

fs.writeFileSync('src/pages/LegacyStudyRoom.tsx', code);
