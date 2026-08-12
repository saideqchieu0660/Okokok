import os

new_code = """import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { store } from "../lib/store";
import { 
  Bot, X, Maximize2, Minimize2, Settings, Plus, Download, FileCode, Sparkles, 
  Send, Brain, LayoutTemplate, MessageSquare, Zap
} from "lucide-react";
import { cn } from "../lib/utils";
import { safeRequest } from "../utils/apiClient";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { useAICooldown } from "../lib/cooldown";
import { db, auth } from "../lib/firebase";
import { collection, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "motion/react";

// --- Tách riêng component hiển thị Sơ đồ tư duy (Generative UI) ---
const GenerativeMindmap = ({ code, onAddCard }: { code: string, onAddCard: (label: string) => void }) => {
  const [activeTab, setActiveTab] = useState<"interactive" | "image" | "code">("interactive");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;
    try {
      const encoded = btoa(unescape(encodeURIComponent(code)));
      setImageUrl(`https://mermaid.ink/svg/${encoded}`);
      setImageError(false);
    } catch (e) {
      console.error("Lỗi mã hóa mermaid", e);
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parsedRoot = useMemo(() => {
    try {
      const lines = code.split("\\n").map(l => l.trim()).filter(l => l && !l.startsWith("%%"));
      if (!lines[0]?.startsWith("mindmap")) return null;
      let rootNode: any = null;
      const stack: { node: any; level: number }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = code.split("\\n")[i]; 
        const indentStr = line.match(/^\\s*/)?.[0] || "";
        const level = indentStr.length;
        const text = line.trim();
        
        const match = text.match(/^([\\w\\d_]+)(?:\\["([^"]+)"\\]|\\(([^)]+)\\)|\\(\\[([^\\]]+)\\]\\)|\\{([^}]+)\\})?/);
        if (!match) continue;
        
        let label = match[2] || match[3] || match[4] || match[5] || match[1];
        let shape = "default";
        if (match[2]) shape = "square";
        else if (match[3]) shape = "rounded";
        else if (match[4]) shape = "circle";
        else if (match[5]) shape = "rhombus";

        const node = { id: match[1], label, shape, children: [] };

        if (!rootNode) {
          rootNode = node;
          stack.push({ node, level });
          continue;
        }

        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length > 0) {
          stack[stack.length - 1].node.children.push(node);
        }
        stack.push({ node, level });
      }
      return rootNode;
    } catch(e) {
      return null;
    }
  }, [code]);

  const renderInteractiveNode = (node: any, index: number, depth: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const shapeClasses = cn(
      "px-3 py-1.5 text-sm font-bold transition-all shadow-sm rounded-xl cursor-pointer flex items-center justify-between border select-none max-w-xs sm:max-w-md",
      node.shape === "circle" 
        ? "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/35 hover:bg-orange-500/25 active:scale-95"
        : node.shape === "square"
        ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700/80 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 active:scale-95"
        : "bg-orange-500/5 text-orange-800 dark:text-orange-300 border-orange-500/20 hover:bg-orange-500/10 active:scale-95"
    );

    return (
      <div key={`${node.id || "node"}-${index}-${depth}`} className="flex flex-col items-start pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 my-2 py-1 relative w-full">
        <div className="absolute left-0 top-[1.2rem] w-4 border-t-2 border-zinc-200 dark:border-zinc-800" />
        
        <div className="flex items-center gap-2 relative z-10 max-w-full group/node">
          <div className={shapeClasses} onClick={() => onAddCard(node.label)}>
            <span className="truncate">{node.label}</span>
          </div>
          
          <button
            onClick={() => onAddCard(node.label)}
            className="w-6 h-6 rounded-full bg-zinc-200/80 hover:bg-orange-500 dark:bg-zinc-800 dark:hover:bg-orange-500 hover:text-black text-zinc-500 dark:text-zinc-400 flex items-center justify-center transition-all cursor-pointer shrink-0 opacity-0 group-hover/node:opacity-100"
            title="Tạo flashcard"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {hasChildren && (
          <div className="mt-2 space-y-2 w-full">
            {node.children.map((child: any, idx: number) => renderInteractiveNode(child, idx, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="my-4 border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl overflow-hidden bg-white/40 dark:bg-zinc-950/20 shadow-md relative w-full">
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-100/50 dark:bg-zinc-900/30 border-b border-zinc-200/50 dark:border-zinc-800 relative z-20">
        <span className="text-xs font-black tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
          SƠ ĐỒ TƯ DUY AI
        </span>
        
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1 border-r border-zinc-300 dark:border-zinc-700 pr-2">
            {imageUrl && !imageError && (
              <button 
                onClick={() => window.open(imageUrl, '_blank')}
                className="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1.5 rounded transition-colors text-zinc-500 dark:text-zinc-400 cursor-pointer"
                title="Tải ảnh"
              ><Download className="w-4 h-4" /></button>
            )}
            <button 
              onClick={handleCopy}
              className="hover:bg-zinc-200 dark:hover:bg-zinc-800 p-1.5 rounded transition-colors text-zinc-500 dark:text-zinc-400 cursor-pointer"
              title="Tải mã"
            ><FileCode className="w-4 h-4" /></button>
          </div>
          
          <div className="flex bg-zinc-200/50 dark:bg-zinc-800/80 p-0.5 rounded-lg shrink-0">
            {parsedRoot && (
              <button
                onClick={() => setActiveTab("interactive")}
                className={cn("px-2.5 py-1 text-xs font-bold rounded-md transition-all", activeTab === "interactive" ? "bg-white dark:bg-zinc-900 shadow text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400")}
              >Phân rã</button>
            )}
            {imageUrl && !imageError && (
              <button
                onClick={() => setActiveTab("image")}
                className={cn("px-2.5 py-1 text-xs font-bold rounded-md transition-all", activeTab === "image" ? "bg-white dark:bg-zinc-900 shadow text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400")}
              >Sơ đồ</button>
            )}
            <button
              onClick={() => setActiveTab("code")}
              className={cn("px-2.5 py-1 text-xs font-bold rounded-md transition-all", activeTab === "code" ? "bg-white dark:bg-zinc-900 shadow text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400")}
            >Mã</button>
          </div>
        </div>
      </div>

      <div className="p-4 overflow-x-auto min-h-[100px] flex items-center justify-start max-w-full">
        {activeTab === "interactive" && parsedRoot && (
          <div className="w-full text-left scale-95 sm:scale-100 origin-left max-w-full">
            {renderInteractiveNode(parsedRoot, 0, 0)}
          </div>
        )}
        {activeTab === "image" && imageUrl && !imageError && (
          <div className="w-full flex items-center justify-center p-2 min-h-[150px] bg-white rounded-lg">
            <img src={imageUrl} alt="Mindmap" className="max-h-[400px] object-contain" onError={() => { setImageError(true); setActiveTab("code"); }} referrerPolicy="no-referrer" />
          </div>
        )}
        {activeTab === "code" && (
          <div className="w-full text-left relative">
            <pre className="font-mono text-xs text-zinc-700 dark:text-zinc-300 overflow-x-auto p-4 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl whitespace-pre-wrap">{code}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Agent3Widget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOmnibarMode, setIsOmnibarMode] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<{role: "user"|"ai", text: string}[]>([]);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  
  const { cooldownRemaining, startCooldown } = useAICooldown();
  const [showSettings, setShowSettings] = useState(false);
  
  const [responseMode, setResponseMode] = useState<"socratic" | "direct" | "debate" | "auto">(() => {
    return (localStorage.getItem("agent3_response_mode") as any) || "socratic";
  });
  const [responseLength, setResponseLength] = useState<"concise" | "detailed" | "super_detailed">(() => {
    return (localStorage.getItem("agent3_response_length") as any) || "detailed";
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = store.getCurrentUser();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeSend = async (textToSend: string, customContext?: string) => {
    if (!textToSend.trim() || isLoading) return;
    
    if (user && user.role === "student" && cooldownRemaining > 0) {
      setMessages(prev => [...prev, { role: "ai", text: `⏳ Bạn ơi, vui lòng đợi thêm ${cooldownRemaining} giây để đặt câu hỏi tiếp theo nhé!` }]);
      return;
    }
    
    setMessages(prev => [...prev, { role: "user", text: textToSend }]);
    setIsLoading(true);
    
    if (user && user.role === "student") {
      startCooldown();
    }

    try {
      const idToken = await auth.currentUser?.getIdToken() || "";
      const baseContext = responseMode === "direct"
        ? "You are Agent 3 - Personal Assistant (Direct & Blunt Mode). STRICT RULES:\\n- TRẢ LỜI TRỰC TIẾP: Cung cấp đáp án ngay lập tức.\\n- FORMAT VẼ SƠ ĐỒ: Khi có lệnh '/draw', sinh mã Mermaid.js bắt đầu bằng 'mindmap'.\\n- QUAN TRỌNG: Mọi tiêu đề node MUST luôn được đặt trong ngoặc vuông và dấu ngoặc kép đôi `id1[\\"Khái niệm\\"]`."
        : "You are Agent 3 - Socrates AI Coach. STRICT RULES:\\n- Gợi mở vấn đề, tập trung học thuật.\\n- FORMAT VẼ SƠ ĐỒ: Khi có lệnh '/draw', sinh mã Mermaid.js bắt đầu bằng 'mindmap'. Dùng ngoặc vuông `id1[\\"Khái niệm\\"]`.";
      
      const context = customContext ? `${baseContext}\\nCurrent Context: ${customContext}` : baseContext;

      const res = await safeRequest("/api/agent3/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "",
          "x-user-is-pro": user?.isPro ? "true" : "false"
        },
        body: JSON.stringify({ 
          message: textToSend, 
          history: messages.filter(m => !(m.role === "ai" && m.text.includes("⏳"))), 
          context, 
          sessionId, 
          lengthMode: responseLength,
          responseMode: responseMode
        })
      });

      if (!res.ok) {
        throw new Error("Lỗi kết nối Agent 3");
      }
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.result }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: "ai", text: error?.message || "Tín hiệu bị nhiễu do bão mặt trời. Vui lòng thử lại." }]);
    }
    setIsLoading(false);
  };

  const handleSend = () => {
    executeSend(input);
    setInput("");
  };

  const handleQuickAction = (cmd: string) => {
    executeSend(cmd);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle extracting blocks
  const parseAIResponse = (text: string, msgIndex: number) => {
    const blocks: React.ReactNode[] = [];
    let currentText = text;

    // Extract Mermaid
    const mermaidRegex = /```mermaid\\s*\\n([\\s\\S]*?)```/g;
    let match;
    let lastIndex = 0;

    while ((match = mermaidRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        blocks.push(<div key={`text-${lastIndex}`} className="prose dark:prose-invert prose-sm md:prose-base max-w-none"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{text.substring(lastIndex, match.index)}</ReactMarkdown></div>);
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
      blocks.push(<div key={`text-${lastIndex}`} className="prose dark:prose-invert prose-sm md:prose-base max-w-none"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{text.substring(lastIndex)}</ReactMarkdown></div>);
    }

    return <div className="space-y-4">{blocks}</div>;
  };

  return (
    <>
      <AnimatePresence>
      {!isOpen && (
        <motion.button 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsOpen(true)}
          id="agent3-side-widget-anchor"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 hover:bg-white dark:hover:bg-zinc-950 transition-all z-50 group cursor-pointer px-5 py-3 gap-2.5"
        >
          <Bot className="w-5 h-5 text-orange-500 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-bold tracking-tight">Hỏi Agent 3</span>
          <span className="hidden sm:flex items-center justify-center text-[10px] font-mono font-black text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 uppercase tracking-wider">⌘J</span>
        </motion.button>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-all duration-300"
            onClick={() => setIsOpen(false)}
          />
          <motion.div 
            layout
            initial={{ opacity: 0, y: isOmnibarMode ? -20 : 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isOmnibarMode ? -20 : 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
            "fixed z-50 flex flex-col bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden transition-all duration-300 border border-zinc-200/50 dark:border-zinc-800/80",
            isMaximized 
              ? "inset-0 sm:inset-4 sm:rounded-3xl" 
              : isOmnibarMode
                ? "top-[10%] left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[700px] h-[75vh] sm:h-[650px] rounded-3xl"
                : "bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[420px] h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl"
          )}>
            
            {/* Header (Command Palette Style) */}
            <div className="flex-shrink-0 border-b border-zinc-100 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md p-2">
              <div className="flex items-center relative group">
                <Bot className="w-5 h-5 text-orange-500 absolute left-4" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Hỏi Agent 3 bất cứ điều gì... (Ví dụ: /draw Hệ thần kinh)"
                  className="w-full bg-transparent pl-12 pr-24 py-4 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none text-base sm:text-lg font-medium"
                  autoFocus
                />
                
                <div className="absolute right-2 flex items-center gap-1">
                  <button onClick={() => setIsOmnibarMode(!isOmnibarMode)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors" title={isOmnibarMode ? "Chuyển sang Sidebar" : "Chuyển sang Omnibar"}>
                    {isOmnibarMode ? <LayoutTemplate className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Empty State / Suggestions */}
            {messages.length === 0 && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Xin chào, tôi là Agent 3</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 max-w-sm">Trợ lý AI siêu việt giúp bạn phân tích chuyên sâu, tạo thẻ học và vẽ sơ đồ tư duy ngay lập tức.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  <button onClick={() => handleQuickAction("/draw Bản đồ tư duy về Trí tuệ nhân tạo")} className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-500/10 transition-all group text-left">
                    <Sparkles className="w-5 h-5 text-zinc-400 group-hover:text-orange-500" />
                    <div>
                      <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Vẽ sơ đồ tư duy</div>
                      <div className="text-xs text-zinc-500 line-clamp-1">Về chủ đề Trí tuệ nhân tạo</div>
                    </div>
                  </button>
                  <button onClick={() => handleQuickAction("Tóm tắt lại kiến thức cốt lõi tôi vừa học")} className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-500/10 transition-all group text-left">
                    <MessageSquare className="w-5 h-5 text-zinc-400 group-hover:text-blue-500" />
                    <div>
                      <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Tóm tắt kiến thức</div>
                      <div className="text-xs text-zinc-500 line-clamp-1">Review lại bài học gần nhất</div>
                    </div>
                  </button>
                  <button onClick={() => handleQuickAction("Tạo 5 thẻ flashcard từ vựng IELTS nâng cao")} className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 transition-all group text-left sm:col-span-2">
                    <Zap className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500" />
                    <div>
                      <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Tạo bộ Flashcard tự động</div>
                      <div className="text-xs text-zinc-500 line-clamp-1">Ví dụ: 5 thẻ từ vựng IELTS nâng cao</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Message Feed */}
            {messages.length > 0 && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                    {msg.role === "user" ? (
                      <div className="bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-2xl rounded-tr-sm text-zinc-800 dark:text-zinc-200 text-[15px] max-w-[85%] border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm">
                        {msg.text}
                      </div>
                    ) : (
                      <div className="w-full text-zinc-800 dark:text-zinc-200 text-[15px] leading-relaxed">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-xs font-bold tracking-wider text-orange-600 dark:text-orange-400 uppercase">Agent 3</span>
                        </div>
                        <div className="pl-8">
                          {parseAIResponse(msg.text, idx)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse">
                        <Bot className="w-3.5 h-3.5 text-orange-500" />
                      </div>
                      <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase animate-pulse">Đang phân tích...</span>
                    </div>
                    <div className="pl-8 w-1/2 h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl animate-pulse" />
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}

          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  );
}
"""

with open("src/components/Agent3Widget.tsx", "w", encoding="utf-8") as f:
    f.write(new_code)
