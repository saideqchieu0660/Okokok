import re

with open('src/components/Agent3Widget.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add GenerativeQuiz component
quiz_component = """
const GenerativeQuiz = ({ data }: { data: any[] }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (showResult[qIdx]) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = (qIdx: number) => {
    if (answers[qIdx] === undefined) return;
    setShowResult(prev => ({ ...prev, [qIdx]: true }));
  };

  if (!Array.isArray(data)) return <div className="text-red-500 text-xs">Lỗi định dạng Quiz</div>;

  return (
    <div className="space-y-4 my-4 w-full">
      <div className="text-xs font-black tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5 uppercase">
        <Sparkles className="w-4 h-4" /> BÀI TẬP TRẮC NGHIỆM
      </div>
      {data.map((q, qIdx) => {
        const isRevealed = showResult[qIdx];
        return (
          <div key={qIdx} className="bg-white/60 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-sm w-full">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-[15px] mb-3">{q.q}</h4>
            <div className="space-y-2">
              {q.options?.map((opt: string, optIdx: number) => {
                const isSelected = answers[qIdx] === optIdx;
                const isCorrect = q.correct === optIdx;
                
                let btnClass = "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20";
                
                if (isRevealed) {
                  if (isCorrect) {
                    btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-300 ring-1 ring-emerald-500/50";
                  } else if (isSelected) {
                    btnClass = "border-red-500 bg-red-50 text-red-800 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-300 ring-1 ring-red-500/50";
                  } else {
                    btnClass = "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 dark:text-zinc-500 opacity-50";
                  }
                } else if (isSelected) {
                  btnClass = "border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-500/50 dark:bg-blue-500/20 dark:text-blue-300 ring-1 ring-blue-500";
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    disabled={isRevealed}
                    className={cn("w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium flex items-start gap-3", btnClass)}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border text-xs font-bold mt-0.5",
                      isRevealed && isCorrect ? "bg-emerald-500 border-emerald-500 text-white" :
                      isRevealed && isSelected && !isCorrect ? "bg-red-500 border-red-500 text-white" :
                      isSelected ? "bg-blue-500 border-blue-500 text-white" :
                      "border-zinc-300 dark:border-zinc-600 bg-transparent text-zinc-500"
                    )}>
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="leading-relaxed">{opt}</span>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              {!isRevealed ? (
                <button 
                  onClick={() => handleSubmit(qIdx)}
                  disabled={answers[qIdx] === undefined}
                  className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 transition-all self-start"
                >
                  Kiểm tra đáp án
                </button>
              ) : (
                <div className="p-3.5 bg-blue-50/80 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 text-sm rounded-xl border border-blue-200/50 dark:border-blue-800/30 w-full animate-in fade-in slide-in-from-top-2">
                  <span className="font-bold flex items-center gap-1.5 mb-1.5"><Bot className="w-4 h-4"/> Giải thích:</span>
                  <span className="leading-relaxed">{q.explanation}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
"""

if "const GenerativeQuiz" not in content:
    content = content.replace("export default function Agent3Widget() {", quiz_component + "\nexport default function Agent3Widget() {")

# 2. Add highlightedContext state
if "const [highlightedContext" not in content:
    content = content.replace('const [showSettings, setShowSettings] = useState(false);', 'const [showSettings, setShowSettings] = useState(false);\n  const [highlightedContext, setHighlightedContext] = useState("");')

# 3. Update keydown logic
old_keydown = """  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);"""

new_keydown = """  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        const selectedText = window.getSelection()?.toString().trim();
        if (selectedText) {
          setHighlightedContext(selectedText);
        }
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);"""

content = content.replace(old_keydown, new_keydown)

# 4. Update executeSend logic
old_exec_start = """  const executeSend = async (textToSend: string, customContext?: string) => {
    if (!textToSend.trim() || isLoading) return;
    
    if (user && user.role === "student" && cooldownRemaining > 0) {"""

new_exec_start = """  const executeSend = async (textToSend: string, customContext?: string) => {
    if (!textToSend.trim() || isLoading) return;
    
    const finalMessage = highlightedContext 
      ? `[Trích dẫn]: "${highlightedContext}"\\n\\nYêu cầu: ${textToSend}` 
      : textToSend;
      
    setHighlightedContext("");

    if (user && user.role === "student" && cooldownRemaining > 0) {"""

content = content.replace(old_exec_start, new_exec_start)

# Ensure finalMessage is used
content = content.replace('setMessages(prev => [...prev, { role: "user", text: textToSend }]);', 'setMessages(prev => [...prev, { role: "user", text: finalMessage }]);')
content = content.replace('message: textToSend,', 'message: finalMessage,')

# 5. Update prompt to handle /quiz
old_prompt = """      const baseContext = responseMode === "direct"
        ? "You are Agent 3 - Personal Assistant (Direct & Blunt Mode). STRICT RULES:\\n- TRẢ LỜI TRỰC TIẾP: Cung cấp đáp án ngay lập tức.\\n- FORMAT VẼ SƠ ĐỒ: Khi có lệnh '/draw', sinh mã Mermaid.js bắt đầu bằng 'mindmap'.\\n- QUAN TRỌNG: Mọi tiêu đề node MUST luôn được đặt trong ngoặc vuông và dấu ngoặc kép đôi `id1[\\"Khái niệm\\"]`."
        : "You are Agent 3 - Socrates AI Coach. STRICT RULES:\\n- Gợi mở vấn đề, tập trung học thuật.\\n- FORMAT VẼ SƠ ĐỒ: Khi có lệnh '/draw', sinh mã Mermaid.js bắt đầu bằng 'mindmap'. Dùng ngoặc vuông `id1[\\"Khái niệm\\"]`.";"""

new_prompt = """      const baseContext = responseMode === "direct"
        ? "You are Agent 3 - Personal Assistant (Direct & Blunt Mode). STRICT RULES:\\n- TRẢ LỜI TRỰC TIẾP.\\n- FORMAT VẼ SƠ ĐỒ: Lệnh '/draw' -> mã Mermaid.js (mindmap).\\n- Lệnh '/quiz': TRẢ VỀ code block ````quiz\\n[{"q":"?","options":["A","B","C","D"],"correct":0,"explanation":"!"}]\\n````."
        : "You are Agent 3 - Socrates AI Coach. STRICT RULES:\\n- Gợi mở vấn đề.\\n- FORMAT VẼ SƠ ĐỒ: Lệnh '/draw' -> mã Mermaid.js (mindmap).\\n- Lệnh '/quiz': TRẢ VỀ code block ````quiz\\n[{"q":"?","options":["A","B","C","D"],"correct":0,"explanation":"!"}]\\n````.";"""

content = content.replace(old_prompt, new_prompt)

# 6. Replace parseAIResponse regex loop
old_parse_regex = """    // Extract Mermaid
    const mermaidRegex = /```mermaid\\s*\\n([\\s\\S]*?)```/g;
    let match;
    let lastIndex = 0;"""

new_parse_regex = """    // Extract Mermaid and Quiz
    const blockRegex = /```(mermaid|quiz)\\s*\\n([\\s\\S]*?)```/g;
    let match;
    let lastIndex = 0;"""

content = content.replace(old_parse_regex, new_parse_regex)

# Replace the inner loop
old_loop = """    while ((match = mermaidRegex.exec(text)) !== null) {
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
    }"""

new_loop = """    while ((match = blockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        blocks.push(...processTextForCards(text.substring(lastIndex, match.index), `text-${lastIndex}`));
      }
      const type = match[1];
      const code = match[2];
      
      if (type === "mermaid") {
        if (code.trim().startsWith("mindmap")) {
          blocks.push(<GenerativeMindmap key={`mermaid-${match.index}`} code={code} onAddCard={(label) => executeSend(`Phân tích khái niệm: ${label}`)} />);
        } else {
          blocks.push(<pre key={`code-${match.index}`} className="p-4 bg-zinc-900 text-zinc-100 rounded-xl my-4 text-xs overflow-x-auto">{code}</pre>);
        }
      } else if (type === "quiz") {
        try {
          const quizData = JSON.parse(code.trim());
          blocks.push(<GenerativeQuiz key={`quiz-${match.index}`} data={quizData} />);
        } catch (e) {
          blocks.push(<div key={`quiz-err-${match.index}`} className="text-red-500 text-xs">Lỗi parse JSON Quiz: {code.substring(0,50)}...</div>);
        }
      }
      
      lastIndex = match.index + match[0].length;
    }"""

content = content.replace(old_loop, new_loop)

# 7. Add UI for highlightedContext above input
context_ui = """            {/* Header (Command Palette Style) */}
            <div className="flex-shrink-0 border-b border-zinc-100 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md p-2">
              
              <AnimatePresence>
                {highlightedContext && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 8 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="mx-2 mt-2"
                  >
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-3 flex items-start gap-3 relative">
                      <div className="mt-0.5"><Sparkles className="w-4 h-4 text-blue-500" /></div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Văn bản đang chọn</div>
                        <div className="text-sm text-blue-900 dark:text-blue-200 line-clamp-2 italic">"{highlightedContext}"</div>
                      </div>
                      <button onClick={() => setHighlightedContext("")} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg text-blue-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center relative group">"""

content = content.replace('            {/* Header (Command Palette Style) */}\n            <div className="flex-shrink-0 border-b border-zinc-100 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md p-2">\n              <div className="flex items-center relative group">', context_ui)


with open('src/components/Agent3Widget.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

