const fs = require('fs');
let code = fs.readFileSync('src/components/DeckList.tsx', 'utf-8');

const startTag = 'sortedAndFilteredDecks.map((deck, idx) => {';
const endTag = '          )\n        ) : (';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const cleanBody = `
                const masteredCount = deck.cards.filter(c => c.mastery >= 80).length;
                const masteryRate = deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;
                
                const estimatedSeconds = deck.cards.reduce((acc, card) => {
                    const m = card.mastery || 0;
                    if (m >= 80) return acc + 10;
                    if (m >= 50) return acc + 25;
                    if (m >= 20) return acc + 40;
                    return acc + 60;
                }, 0);
                const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
                
                const isOfflineUnavailable = !isOnline && !offlineDeckIds.has(deck.id);

                return (
                  <TiltCard key={\`\${deck.id || "deck"}-\${idx}\`} delayIdx={idx} onClick={() => navigate(\`/study/\${deck.id}\`)} className={cn(
                    "shrink-0 h-auto w-full",
                    isOfflineUnavailable && "opacity-40 grayscale pointer-events-none"
                  )}>
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                      {isOfflineUnavailable && (
                         <div className="px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider flex items-center border-2 border-red-500/20 backdrop-blur-md shadow-sm">
                            Offline
                         </div>
                      )}
                      {offlineDeckIds.has(deck.id) && (
                         <div className="p-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400" title="Đã có thể học offline">
                           <Check className="w-5 h-5" />
                         </div>
                      )}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeckMenu(showDeckMenu === deck.id ? null : deck.id); }}
                          className="p-2 rounded-full transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          title="Tùy chọn"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {showDeckMenu === deck.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setShowDeckMenu(null);
                              }}
                            />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden py-1">
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeckMenu(null); togglePin(deck.id); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-200 transition-colors"
                              >
                                {pinnedDecks.includes(deck.id) ? (
                                  <><PinOff className="w-4 h-4" /> Bỏ ghim</>
                                ) : (
                                  <><Pin className="w-4 h-4" /> Ghim học phần</>
                                )}
                              </button>
                                
                              {(isAdmin || deck.createdBy === currentUser?.id) && (
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeckMenu(null); if (onEditDeck) onEditDeck(deck); else setLocalEditingDeck(deck); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-blue-600 transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  Sửa tên & danh mục
                                </button>
                              )}
                                
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeckMenu(null); setClassModalDeckIds([deck.id]); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-orange-600 transition-colors"
                              >
                                <Layers className="w-4 h-4" />
                                Thêm vào Lớp học
                              </button>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShowDeckMenu(null);
                                  const deckUrl = \`\${window.location.origin}/study/\${deck.id}\`;
                                  const shareText = \`📚 Học phần: \${deck.title}\\n👉 Tham gia học ngay: \${deckUrl}\`;
                                  navigator.clipboard.writeText(shareText).then(() => {
                                    toast.success("Đã sao chép link học phần!");
                                  }).catch(() => toast.error("Không thể sao chép."));
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-blue-600 transition-colors"
                              >
                                <Share2 className="w-4 h-4" />
                                Chia sẻ học phần
                              </button>

                              {isOnline && !offlineDeckIds.has(deck.id) && (
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeckMenu(null); handleDownloadOffline(e, deck.id); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-emerald-600 transition-colors"
                                >
                                  {downloadingDecks.has(deck.id) ? <Check className="w-4 h-4 animate-pulse" /> : <DownloadCloud className="w-4 h-4" />}
                                  Tải xuống Offline
                                </button>
                              )}

                              <div className="w-full h-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>

                              <button
                                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeckMenu(null); handleDownloadJson(deck, false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-purple-600 transition-colors"
                              >
                                <FileJson className="w-4 h-4" />
                                Tải JSON (Toàn bộ)
                              </button>
                              <button
                                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeckMenu(null); handleDownloadJson(deck, true); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-purple-600 transition-colors"
                              >
                                <FileJson className="w-4 h-4" />
                                Tải JSON (Thẻ X)
                              </button>
                              {isFeatureEnabled('ENABLE_VIBE_BACKUP_RESTORE_X') && (
                                <div className="px-4 py-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                                  <VibeBackupRestoreX
                                     deckId={deck.id}
                                    deckTitle={deck.title}
                                    cards={deck.cards}
                                  />
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="relative z-10 flex flex-col h-full [transform:translateZ(30px)] pt-2">
                      <h4 className="font-extrabold text-xl sm:text-2xl mb-2 pr-10 group-hover:text-orange-500 transition-colors line-clamp-2 break-all break-words leading-relaxed">{deck.title}</h4>
                        
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-xs sm:text-sm px-2.5 py-1 rounded-lg font-mono font-black uppercase tracking-wider bg-orange-500/15 text-orange-600 dark:text-orange-400 border-2 border-orange-500/20 leading-relaxed">
                          {getCreatorLabel(deck)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1 rounded-lg font-mono font-black uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border-2 border-purple-500/20 leading-relaxed">
                          {deck.cards?.length || 0} Thẻ
                        </span>
                        {(() => {
                          const now = Date.now();
                          const dueCount = deck.cards ? deck.cards.filter(c => c.nextReview && c.nextReview <= now).length : 0;
                          if (dueCount > 0 && isFeatureEnabled("vibe-spaced-repetition-tracker")) {
                            return (
                              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-extrabold bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-sm animate-pulse">
                                🔥 Cần ôn: {dueCount} thẻ
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      
                      {(() => {
                        const now = Date.now();
                        const dueCount = deck.cards ? deck.cards.filter(c => c.nextReview && c.nextReview <= now).length : 0;
                        if (dueCount > 0 && isFeatureEnabled("vibe-spaced-repetition-tracker")) {
                          return (
                            <div className="mt-auto pt-2">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(\`/study/\${deck.id}\`);
                                }}
                                className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                              >
                                <span>⚡ Ôn ngay 1-Click</span>
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </TiltCard>
                );
              })}
            </div>
`;
  
  const newCode = code.substring(0, startIndex + startTag.length) + cleanBody + code.substring(endIndex);
  fs.writeFileSync('src/components/DeckList.tsx', newCode);
  console.log('Fixed DeckList.tsx successfully');
} else {
  console.log('Could not find start/end tags');
}
