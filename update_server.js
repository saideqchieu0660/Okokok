const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');
content = content.replace(
  'KHÔNG THAY ĐỔI, KHÔNG CẮT BỚT, KHÔNG SÁNG TÁC THÊM bất kỳ nội dung, từ ngữ, hay ý nghĩa cốt lõi nào của thẻ.',
  'TUYỆT ĐỐI KHÔNG THAY ĐỔI, KHÔNG THÊM, KHÔNG XÓA, KHÔNG DIỄN GIẢI lại bất kỳ từ ngữ nào. Toàn bộ dữ liệu gốc PHẢI được giữ nguyên vẹn 100%, CHỈ CHÈN THÊM ký tự xuống dòng (\\n) và khoảng trắng (space).'
);
fs.writeFileSync('server.ts', content);
