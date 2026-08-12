const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'vibe-sandbox', 'VibeSidebar.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace labels with emojis
content = content.replace('label: "Dashboard",', 'label: "🏠 Trang Chủ",');
content = content.replace('label: "Study Sets",', 'label: "📚 Study Sets",');
content = content.replace('label: "Thư Viện",', 'label: "📚 Thư Viện",');
content = content.replace('label: "Tạo Bộ Thẻ",', 'label: "✨ Tạo Bộ Thẻ",');
content = content.replace('label: "Lớp Học",', 'label: "🏫 Lớp Học",');
content = content.replace('label: "Tiến Độ & Xếp Hạng",', 'label: "🏆 Bảng Xếp Hạng",');
content = content.replace('label: "Hồ Sơ Cá Nhân",', 'label: "👤 Hồ Sơ",');
content = content.replace('label: "Cài Đặt",', 'label: "⚙️ Cài Đặt",');

// Remove item.icon render for group header
content = content.replace(/<item\.icon className="w-4 h-4 text-orange-500" \/>/g, '');

// Remove Icon render for normal items
const iconRenderPattern = /<Icon[\s\S]*?\/>/g;
content = content.replace(iconRenderPattern, '');

fs.writeFileSync(file, content, 'utf8');
console.log("Patched VibeSidebar");
