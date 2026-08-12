const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentConverter.tsx', 'utf8');

code = code.replace(
    '🔑 Lưu Học Phần Vào Thư Viện\n              </button>\n            </div>\n\n            {/* Pagination Controls bar */}',
    '🔑 Lưu Học Phần Vào Thư Viện\n              </button>\n              </div>\n            </div>\n\n            {/* Pagination Controls bar */}'
);

fs.writeFileSync('src/components/DocumentConverter.tsx', code);
