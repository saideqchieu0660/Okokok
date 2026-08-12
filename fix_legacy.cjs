const fs = require('fs');
let code = fs.readFileSync('src/pages/LegacyStudyRoom.tsx', 'utf8');

const lastFunctionEnd = code.lastIndexOf('}');
// Ensure the file ends with only one balanced bracket for the default export.
// It seems there is an extra `}` or I removed something incorrectly.
// Let's count brackets? Or just look at the exact error.
