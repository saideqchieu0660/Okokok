const fs = require('fs');
const file = 'src/vibe-sandbox/VibeClasses.tsx';
let content = fs.readFileSync(file, 'utf8');

const renderTarget = `      {!activeClassId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
// We will replace everything from {!activeClassId ? to the end of the file except the closing </div> ); };

// To be safe, let's just do a string split/replace manually.
const splitParts = content.split(`      {!activeClassId ? (`);
if (splitParts.length === 2) {
  const topPart = splitParts[0];
  const replacement = `      <StickyNav 
        sections={classes.map(cls => ({
          id: cls.id,
          title: cls.name,
          items: cls.deckIds.map(deckId => {
            const deck = store.getDecks().find(d => d.id === deckId);
            return { id: deckId, title: deck?.title || "Unknown Deck" };
          })
        }))}
        activeSectionId={activeSectionId}
        onSectionClick={handleSectionClick}
        onItemClick={handleItemClick}
      />

      <div className="space-y-12">
        {classes.length === 0 && !isCreating && (
          <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <Users className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-xl font-bold text-zinc-500 mb-2">Bạn chưa tham gia lớp học nào</h3>
            <p className="text-zinc-400 mb-6">Tạo một lớp học mới hoặc tham gia bằng mã được chia sẻ</p>
          </div>
        )}

        {classes.map(activeClass => (
          <div key={activeClass.id} id={\`section-\${activeClass.id}\`} data-section-id={activeClass.id} className="space-y-6 pt-4">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold">{activeClass.name}</h2>
              <span className="text-sm px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500 font-bold">
                ID: {activeClass.id}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lớp Học Info & Roster */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-500" /> Thông tin lớp
                  </h3>
                  <p className="text-zinc-500 text-sm mb-6">{activeClass.description || "Không có mô tả"}</p>
                  
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Mã mời tham gia</div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white dark:bg-zinc-950 px-3 py-2 rounded-lg text-orange-600 font-mono text-sm border border-orange-500/20 truncate">
                        {activeClass.id}
                      </code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(activeClass.id);
                          setCopiedId(activeClass.id);
                          setTimeout(() => setCopiedId(null), 2000);
                          toast.success("Đã sao chép mã mời!");
                        }}
                        className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition shrink-0"
                      >
                        {copiedId === activeClass.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" /> Thành viên ({activeClass.members.length})
                  </h3>
                  <div className="space-y-3">
                    {activeClass.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-sm">{member.name} {member.id === currentUserId ? "(Bạn)" : ""}</span>
                        </div>
                        {member.role === 'admin' && (
                          <span className="text-[10px] font-black uppercase bg-orange-500/10 text-orange-500 px-2 py-1 rounded">Admin</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Study Material & Progress */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-500" /> Học phần của lớp
                    </h3>
                    {activeClass.createdBy === currentUserId && (
                      <span className="text-xs bg-orange-500/10 text-orange-600 px-3 py-1.5 rounded-full font-bold">
                        💡 Vào các học phần để thêm vào lớp
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {activeClass.deckIds.length === 0 ? (
                      <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                        <p className="text-zinc-500">Chưa có học phần nào được thêm vào lớp này.</p>
                      </div>
                    ) : (
                      activeClass.deckIds.map(deckId => {
                        const deck = store.getDecks().find(d => d.id === deckId);
                        if (!deck) return null;
                        return (
                          <div key={deckId} id={\`deck-\${activeClass.id}-\${deckId}\`} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:border-orange-500/50 transition">
                            <div>
                              <h4 className="font-bold text-lg mb-1">{deck.title}</h4>
                              <div className="flex gap-3 text-xs text-zinc-500 font-medium">
                                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{deck.cards?.length || 0} thẻ</span>
                                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{deck.subject || "Chung"}</span>
                              </div>
                            </div>
                            <Link to={\`/study/\${deck.id}\`} className="p-3 bg-orange-500/10 text-orange-600 rounded-full hover:bg-orange-500/20 transition">
                              <Play className="w-5 h-5" />
                            </Link>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" /> Bảng xếp hạng tiến độ
                  </h3>
                  <div className="space-y-3">
                    {activeClass.members.map((member, idx) => (
                      <div key={member.id} className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                        <div className="w-6 font-mono font-bold text-zinc-400 text-center">#{idx + 1}</div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">{member.name}</span>
                            <span className="text-xs font-bold text-orange-500">{Math.floor(Math.random() * 40) + 10}%</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400" style={{ width: \`\${Math.floor(Math.random() * 40) + 10}%\` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
`;
  
  const newContent = topPart + replacement;
  fs.writeFileSync(file, newContent, 'utf8');
  console.log("Patched VibeClasses.tsx render part.");
} else {
  console.log("Could not split file properly.");
}

