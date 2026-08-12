with open('src/components/Agent3Widget.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Add toast import
if 'import { toast }' not in content:
    content = content.replace('import { store } from "../lib/store";', 'import { store } from "../lib/store";\nimport { toast } from "sonner";')

# Inject quick save function inside Agent3Widget
quick_save_func = """
  const handleQuickSaveCard = async (front: string, back: string) => {
    try {
      const cardObj = {
        id: uuidv4(),
        front,
        back,
        ipa: "",
        example: "",
        subject: "Agent 3",
        mastery: 0,
        isHard: false,
        nextReview: Date.now(),
        nextReviewDate: Date.now(),
        repetitionCount: 0,
        isNewCard: true
      };
      
      const aiDeckId = "deck_agent3_saved";
      let aiDeck = store.getDeck(aiDeckId);
      
      if (!aiDeck) {
        aiDeck = {
          id: aiDeckId,
          title: "Thẻ lưu từ Agent 3",
          subject: "AI",
          cards: [cardObj]
        };
      } else {
        aiDeck = { ...aiDeck, cards: [...(aiDeck.cards || []), cardObj] };
      }
      
      await store.addDeck(aiDeck);
      toast.success(`Đã lưu "${front}" vào bộ thẻ: Thẻ lưu từ Agent 3`);
    } catch (e) {
      toast.error("Lỗi khi lưu thẻ!");
      console.error(e);
    }
  };
"""

# Find where to put it
if "const handleQuickSaveCard" not in content:
    content = content.replace('const handleSend = () => {', quick_save_func + '\n  const handleSend = () => {')

# Replace the onSave action to use handleQuickSaveCard
content = content.replace("onSave={() => executeSend(`Tạo thẻ: ${cardMatch[1].trim()}`)}", "onSave={() => handleQuickSaveCard(cardMatch[1].trim(), cardMatch[2].trim())}")

with open('src/components/Agent3Widget.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
