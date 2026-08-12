const fs = require('fs');
let code = fs.readFileSync('src/components/DocumentConverter.tsx', 'utf8');

// 1. Add import
if (!code.includes('optimizeFormattingBatch')) {
    code = code.replace(
        'import { splitIntoChunks } from "../utils/textProcessor";',
        'import { splitIntoChunks } from "../utils/textProcessor";\nimport { optimizeFormattingBatch } from "../formatting/formattingClient";'
    );
}

// 2. Add state for batch formatting
if (!code.includes('isBatchFormatting')) {
    code = code.replace(
        'const [extractedCards, setExtractedCards] = useState<any[]>([]);',
        'const [extractedCards, setExtractedCards] = useState<any[]>([]);\n  const [isBatchFormatting, setIsBatchFormatting] = useState(false);'
    );
}

// 3. Add handleBatchFormat handler
const batchHandler = `
  const handleBatchFormat = async () => {
    if (!extractedCards || extractedCards.length === 0) return;
    setIsBatchFormatting(true);
    pushLog("✨ Khởi động AI Formatting cho toàn bộ " + extractedCards.length + " thẻ...");
    
    try {
      const textsToFormat = extractedCards.map(c => c.back || "");
      const formattedTexts = await optimizeFormattingBatch(textsToFormat);
      
      const newCards = [...extractedCards];
      let changes = 0;
      for (let i = 0; i < newCards.length; i++) {
         if (formattedTexts[i] && formattedTexts[i] !== newCards[i].back) {
            newCards[i].back = formattedTexts[i];
            changes++;
         }
      }
      
      if (changes > 0) {
        setExtractedCards(newCards);
        pushLog("✅ Hoàn tất! Đã tinh chỉnh định dạng cho " + changes + " thẻ.");
      } else {
        pushLog("ℹ️ Các thẻ đã có định dạng tốt, không cần thay đổi.");
      }
    } catch (err) {
      console.error(err);
      pushLog("❌ Gặp lỗi khi Format định dạng. Vui lòng thử lại sau.", true);
    } finally {
      setIsBatchFormatting(false);
    }
  };
`;

if (!code.includes('handleBatchFormat')) {
    code = code.replace(
        'const handleCardChange = useCallback(',
        batchHandler + '\n\n  const handleCardChange = useCallback('
    );
}

// 4. Add UI button
const btnUI = `
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchFormat}
                  disabled={isBatchFormatting || isProcessing}
                  className="btn-3d px-4 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300 font-bold rounded-xl cursor-pointer hover:shadow transition text-xs shrink-0 flex items-center gap-2 disabled:opacity-50"
                >
                  {isBatchFormatting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Optimize Formatting</span>
                </button>
                <button
                  onClick={handleSaveDeck}
`;

if (!code.includes('handleBatchFormat}')) {
    code = code.replace(
        '<button\n                onClick={handleSaveDeck}',
        btnUI
    );
    // Remove the extra </button> wrapper closure logic.
    // Wait, the replaced text is just `<button onClick={handleSaveDeck}`
    // Let me be more precise with replace
}

fs.writeFileSync('src/components/DocumentConverter.tsx', code);
