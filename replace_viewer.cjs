const fs = require('fs');
const content = fs.readFileSync('src/components/FlashcardViewer.tsx', 'utf-8');

const startIndex = content.indexOf('  const renderClozeSentence = () => {');
if (startIndex === -1) {
  console.log("Could not find start index");
  process.exit(1);
}

const beforeContent = content.substring(0, startIndex);

const replacement = `  const renderClozeSentence = () => {
    if (!activeCard.example_sentence) return null;
    
    // Finding [targetWord]
    const regex = /\\[(.*?)\\]/;
    const match = activeCard.example_sentence.match(regex);
    
    if (!match) return (
        <p className="text-xl sm:text-2xl font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed break-words whitespace-pre-wrap text-left w-full">
            {activeCard.example_sentence}
        </p>
    );
    
    const targetWord = match[1];
    const sentenceBefore = activeCard.example_sentence.substring(0, match.index);
    const sentenceAfter = activeCard.example_sentence.substring(match.index! + match[0].length);
    
    const hint = targetWord.charAt(0) + "_".repeat(targetWord.length - 1);
    
    return (
        <p className="text-xl sm:text-3xl font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed break-words whitespace-pre-wrap text-left w-full">
            {sentenceBefore}
            <span className={\`inline-flex items-center justify-center min-w-[3ch] px-2 py-0.5 mx-1 rounded-lg transition-colors \${isFlipped ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 font-bold" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold"}\`}>
                {isFlipped ? targetWord : (isHintRevealed ? hint : "________")}
            </span>
            {sentenceAfter}
        </p>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-start p-4 sm:p-6 w-full max-w-3xl mx-auto space-y-6 h-full max-h-screen">
      
      {/* Sleek Minimal UI Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold rounded-full shadow-lg animate-in fade-in slide-in-from-top-4 z-50">
          {toastMessage}
        </div>
      )}

      {/* Header Controls & Progress */}
      <div className="w-full flex flex-col gap-3">
         <div className="flex justify-between items-center text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            <span>Thẻ {currentCardIndex + 1} / {deckCards.length}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsClozeMode(!isClozeMode)}
                className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition cursor-pointer \${
                  isClozeMode ? "bg-orange-500 text-white border-orange-500" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800"
                }\`}
              >
                {isClozeMode ? "🟢 Cloze" : "⚪ Cloze"}
              </button>
              {isClozeMode && !isFlipped && (
                <button
                  onClick={() => setIsHintRevealed(true)}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800 transition cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 font-bold"
                >
                  💡 Gợi ý
                </button>
              )}
              <button
                onClick={handleFormatCard}
                disabled={isFormatting}
                className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full border border-purple-200 dark:border-purple-800 transition cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 flex items-center gap-1.5 disabled:opacity-50 font-bold"
                title="Optimize Formatting"
              >
                {isFormatting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Format</span>
              </button>
            </div>
         </div>
         <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: \`\${((currentCardIndex + 1) / deckCards.length) * 100}%\` }}
            />
         </div>
      </div>

      {/* Card UI */}
      <div 
        className="cursor-pointer w-full min-h-[24rem] max-h-[65vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col p-6 sm:p-10 transition-transform active:scale-[0.99] relative group"
        onClick={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            setIsFlipped(!isFlipped);
        }}
      >
        <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8 my-auto">
          {formattedText ? (
             <div className="w-full text-left space-y-5 animate-in fade-in">
                 <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                         ✨ AI Formatted Preview
                     </span>
                 </div>
                 <div className="whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200 leading-relaxed text-lg sm:text-xl font-medium">
                     {formattedText}
                 </div>
                 <div className="flex gap-3 justify-center pt-4 border-t border-zinc-100 dark:border-zinc-800">
                     <button onClick={(e) => { e.stopPropagation(); setFormattedText(null); }} className="px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-sm transition">
                         Hủy
                     </button>
                     <button onClick={(e) => { e.stopPropagation(); handleSaveFormatted(); }} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-md">
                         <Save className="w-4 h-4"/> Áp dụng
                     </button>
                 </div>
             </div>
          ) : (
             <div className="w-full flex flex-col items-center justify-center space-y-6">
                {isClozeMode && activeCard.example_sentence ? (
                    <>
                        {renderClozeSentence()}
                        {isFlipped && (
                            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 mt-6 space-y-6">
                                <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0" />
                                <div className="w-full text-left whitespace-pre-wrap break-words text-lg sm:text-xl font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 mr-2 block mb-2">{activeCard.front}</span>
                                    {activeCard.back}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {!isFlipped ? (
                            <div className="w-full text-center whitespace-pre-wrap break-words">
                                <h2 className="text-3xl sm:text-5xl font-display font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                                    {activeCard.front}
                                </h2>
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 space-y-6">
                                <h3 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 dark:text-zinc-100 text-center break-words w-full">
                                    {activeCard.front}
                                </h3>
                                <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0" />
                                <div className="w-full text-left whitespace-pre-wrap break-words text-lg sm:text-xl font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                    {activeCard.back}
                                </div>
                            </div>
                        )}
                    </>
                )}
             </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-4 w-full pt-2">
        <button 
           onClick={handlePrev}
           disabled={currentCardIndex === 0}
           className="flex-1 px-4 py-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-2xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base active:scale-[0.98]"
        >
          Trở lại
        </button>
        <button 
           onClick={handleNext}
           disabled={currentCardIndex === deckCards.length - 1}
           className="flex-1 px-4 py-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-2xl font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base active:scale-[0.98]"
        >
          Tiếp theo
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/FlashcardViewer.tsx', beforeContent + replacement, 'utf-8');
console.log("Replacement successful.");
