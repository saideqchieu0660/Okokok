with open('src/components/Agent3Widget.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We need to escape the inner quotes or use backticks.
# Let's just find the offending lines and replace them.

bad_direct = '"You are Agent 3 - Personal Assistant (Direct & Blunt Mode). STRICT RULES:\\n- TRẢ LỜI TRỰC TIẾP.\\n- FORMAT VẼ SƠ ĐỒ: Lệnh \'/draw\' -> mã Mermaid.js (mindmap).\\n- Lệnh \'/quiz\': TRẢ VỀ code block ````quiz\\n[{"q":"?","options":["A","B","C","D"],"correct":0,"explanation":"!"}]\\n````."'
good_direct = '`You are Agent 3 - Personal Assistant (Direct & Blunt Mode). STRICT RULES:\\n- TRẢ LỜI TRỰC TIẾP.\\n- FORMAT VẼ SƠ ĐỒ: Lệnh \'/draw\' -> mã Mermaid.js (mindmap).\\n- Lệnh \'/quiz\': TRẢ VỀ code block \\`\\`\\`quiz\\n[{"q":"?","options":["A","B","C","D"],"correct":0,"explanation":"!"}]\\n\\`\\`\\`.`'

bad_soc = '"You are Agent 3 - Socrates AI Coach. STRICT RULES:\\n- Gợi mở vấn đề.\\n- FORMAT VẼ SƠ ĐỒ: Lệnh \'/draw\' -> mã Mermaid.js (mindmap).\\n- Lệnh \'/quiz\': TRẢ VỀ code block ````quiz\\n[{"q":"?","options":["A","B","C","D"],"correct":0,"explanation":"!"}]\\n````."'
good_soc = '`You are Agent 3 - Socrates AI Coach. STRICT RULES:\\n- Gợi mở vấn đề.\\n- FORMAT VẼ SƠ ĐỒ: Lệnh \'/draw\' -> mã Mermaid.js (mindmap).\\n- Lệnh \'/quiz\': TRẢ VỀ code block \\`\\`\\`quiz\\n[{"q":"?","options":["A","B","C","D"],"correct":0,"explanation":"!"}]\\n\\`\\`\\`.`'

content = content.replace(bad_direct, good_direct)
content = content.replace(bad_soc, good_soc)

with open('src/components/Agent3Widget.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
