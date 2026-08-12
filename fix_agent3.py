with open('src/components/Agent3Widget.tsx', 'r') as f:
    content = f.read()

import re

# Find the exact duplicate mess and replace it with the correct closing tags.
# Look for: <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1.5 rounded-full transition cursor-pointer"><X className="w-5 h-5" /></button>\n             </div>\n           </div>...
pattern = r'<button onClick=\{\(\) => setIsOpen\(false\)\} className="hover:bg-black/10 p-1\.5 rounded-full transition cursor-pointer"><X className="w-5 h-5" /></button>\n             </div>\n           </div>.*?(?:{/\* Behavior Settings Window \*/}|<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/50 relative">)'

# We just want to extract everything up to `</button>\n             </div>\n           </div>` and then attach the rest properly.
# Wait, it's easier to use a targeted regex.

start_str = '<button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1.5 rounded-full transition cursor-pointer"><X className="w-5 h-5" /></button>\n             </div>\n           </div>'
end_str = '{/* Behavior Settings Window */}'

idx1 = content.find(start_str)
if idx1 != -1:
    idx2 = content.find(end_str, idx1)
    if idx2 != -1:
        new_content = content[:idx1 + len(start_str)] + '\n           ' + content[idx2:]
        with open('src/components/Agent3Widget.tsx', 'w') as f:
            f.write(new_content)
        print("Fixed.")
    else:
        print("end_str not found")
else:
    print("start_str not found")

