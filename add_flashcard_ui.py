with open('src/components/Agent3Widget.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

flashcard_component = """
const GenerativeFlashcard = ({ front, back, onSave }: { front: string, back: string, onSave: () => void }) => {
  return (
    <div className="my-3 flex items-center justify-between p-3.5 bg-gradient-to-br from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl shadow-sm group">
      <div className="flex-1 pr-4">
        <div className="text-xs font-black tracking-wider text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-1.5 uppercase">
          <Zap className="w-3.5 h-3.5" /> Thẻ gợi ý
        </div>
        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] mb-1">{front}</div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{back}</div>
      </div>
      <button 
        onClick={onSave}
        className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center hover:scale-105 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:border-orange-500 transition-all text-zinc-400 cursor-pointer shrink-0"
        title="Lưu vào bộ thẻ"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};
"""

if "const GenerativeFlashcard" not in content:
    content = content.replace("export default function Agent3Widget() {", flashcard_component + "\nexport default function Agent3Widget() {")

start_marker = "  // Handle extracting blocks"
end_marker = "  return (\n    <>\n      <AnimatePresence>"

idx1 = content.find(start_marker)
idx2 = content.find(end_marker)

new_parse = """  // Handle extracting blocks
  const parseAIResponse = (text: string, msgIndex: number) => {
    const blocks: React.ReactNode[] = [];
    let currentText = text;

    // First, let's extract flashcard patterns like **Khái niệm**: Định nghĩa
    const lines = currentText.split('\\n');
    let buffer: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Check for flashcard format
      const cardMatch = line.match(/^\\*\\*(.+?)\\*\\*\\s*[:\\-]\\s*(.+)/);
      
      if (cardMatch && !line.includes("```mermaid")) {
        // flush buffer
        if (buffer.length > 0) {
          const bufText = buffer.join('\\n');
          
          // Before flushing buffer, check for mermaid inside buffer!
          // Actually, it's safer to just push the whole buffer string as a single text block
          // and let the mermaid parser handle it next. Wait, mermaid can span multiple lines.
          // Let's just push buffer to a new array and join them later, OR we replace flashcards FIRST.
          // Better approach: Replace flashcards with a placeholder, or just render buffer later.
        }
      }
    }
    
    // Better Regex approach for Flashcards:
    const flashcardRegex = /\\*\\*(.+?)\\*\\*\\s*[:\\-]\\s*(.+)/g;
    
    // Split by flashcards?
    // Let's use a simpler approach. Just run mermaid extraction, then inside text blocks, run flashcard extraction.
"""

new_parse_better = """  // Handle extracting blocks
  const parseAIResponse = (text: string, msgIndex: number) => {
    const blocks: React.ReactNode[] = [];

    // Extract Mermaid
    const mermaidRegex = /```mermaid\\s*\\n([\\s\\S]*?)```/g;
    let match;
    let lastIndex = 0;

    const processTextForCards = (t: string, keyPrefix: string) => {
      const textBlocks: React.ReactNode[] = [];
      const lines = t.split('\\n');
      let buffer: string[] = [];
      let counter = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const cardMatch = line.match(/^\\*\\*(.+?)\\*\\*\\s*[:\\-]\\s*(.+)/);
        
        if (cardMatch) {
          if (buffer.length > 0) {
            textBlocks.push(
              <div key={`${keyPrefix}-buf-${counter++}`} className="prose dark:prose-invert prose-sm md:prose-base max-w-none">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{buffer.join('\\n')}</ReactMarkdown>
              </div>
            );
            buffer = [];
          }
          textBlocks.push(
            <GenerativeFlashcard 
              key={`${keyPrefix}-card-${counter++}`} 
              front={cardMatch[1].trim()} 
              back={cardMatch[2].trim()} 
              onSave={() => executeSend(`Tạo thẻ: ${cardMatch[1].trim()}`)} 
            />
          );
        } else {
          buffer.push(line);
        }
      }
      if (buffer.length > 0) {
        textBlocks.push(
          <div key={`${keyPrefix}-buf-${counter++}`} className="prose dark:prose-invert prose-sm md:prose-base max-w-none">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{buffer.join('\\n')}</ReactMarkdown>
          </div>
        );
      }
      return textBlocks;
    };

    while ((match = mermaidRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        blocks.push(...processTextForCards(text.substring(lastIndex, match.index), `text-${lastIndex}`));
      }
      const code = match[1];
      if (code.trim().startsWith("mindmap")) {
        blocks.push(<GenerativeMindmap key={`mermaid-${match.index}`} code={code} onAddCard={(label) => executeSend(`Phân tích khái niệm: ${label}`)} />);
      } else {
        blocks.push(<pre key={`code-${match.index}`} className="p-4 bg-zinc-900 text-zinc-100 rounded-xl my-4 text-xs overflow-x-auto">{code}</pre>);
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      blocks.push(...processTextForCards(text.substring(lastIndex), `text-${lastIndex}`));
    }

    return <div className="space-y-4">{blocks}</div>;
  };

"""

if idx1 != -1 and idx2 != -1:
    content = content[:idx1] + new_parse_better + content[idx2:]
    with open('src/components/Agent3Widget.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
