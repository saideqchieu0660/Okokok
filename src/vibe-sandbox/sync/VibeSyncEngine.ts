import React, { useEffect } from "react";
import { get, set, del, keys } from "idb-keyval";
import { db } from "../../lib/firebase";
import { collection, doc, getDocs, query, where, writeBatch, getDoc } from "firebase/firestore";
import { Deck, store } from "../../lib/store";
import { isFeatureEnabled } from "../../features.config";
import { auth } from "../../lib/firebase";

const SYNC_QUEUE_KEY = "vibe_offline_sync_queue_v3";
const DEBOUNCE_MS = 3000;

export interface SyncAction {
  id: string;
  type: "UPSERT_DECK" | "DELETE_DECK" | "UPSERT_PROFILE" | "UPSERT_PROGRESS" | "UPSERT_CARD_STATE";
  payload: any;
  timestamp: number;
}

class SyncEngineClass {
  private isSyncing = false;
  private listeners: (() => void)[] = [];
  private syncTimeout: any = null;

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  async getQueue(): Promise<SyncAction[]> {
    return (await get<SyncAction[]>(SYNC_QUEUE_KEY)) || [];
  }

  async setQueue(queue: SyncAction[]) {
    await set(SYNC_QUEUE_KEY, queue);
  }

  // Unified enqueue with debounce strategy (Batched Sync)
  async enqueueChange(action: Omit<SyncAction, "id" | "timestamp">) {
    const queue = await this.getQueue();
    // Resolve conflicts inside queue if they target the same entity
    const existingIdx = queue.findIndex(q => q.type === action.type && q.payload.id === action.payload.id);
    if (existingIdx !== -1) {
      queue[existingIdx] = {
        ...queue[existingIdx],
        payload: { ...queue[existingIdx].payload, ...action.payload }, // Merge payload
        timestamp: Date.now()
      };
    } else {
      queue.push({
        ...action,
        id: `sync_${Date.now()}_${Math.random().toString(36).substring(2,9)}`,
        timestamp: Date.now()
      });
    }
    
    await this.setQueue(queue);
    
    if (navigator.onLine) {
      this.scheduleSync();
    }
  }

  scheduleSync() {
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => {
      this.syncNow();
    }, DEBOUNCE_MS);
  }

  async syncNow() {
    if (this.isSyncing || !navigator.onLine) return;
    this.isSyncing = true;
    
    try {
      let queue = await this.getQueue();
      
      if (queue.length > 0) {
        const batch = writeBatch(db);
        for (const item of queue) {
          if (item.type === "UPSERT_DECK") {
            const deckRef = doc(db, "vibe_decks", item.payload.id);
            batch.set(deckRef, { ...item.payload, lastUpdatedAt: item.timestamp }, { merge: true });
          } else if (item.type === "DELETE_DECK") {
            const deckRef = doc(db, "vibe_decks", item.payload.id);
            batch.delete(deckRef);
          } else if (item.type === "UPSERT_PROFILE") {
            const profileRef = doc(db, "users", item.payload.id);
            batch.set(profileRef, { ...item.payload, lastUpdatedAt: item.timestamp }, { merge: true });
          } else if (item.type === "UPSERT_CARD_STATE") {
            const cardStateRef = doc(db, "users", item.payload.uid, "cardsState", item.payload.cardId);
            batch.set(cardStateRef, { ...item.payload, lastUpdatedAt: item.timestamp }, { merge: true });
          } else if (item.type === "UPSERT_PROGRESS") {
             const progressRef = doc(db, "vibe_progress", item.payload.id);
             batch.set(progressRef, { ...item.payload, lastUpdatedAt: item.timestamp }, { merge: true });
          }
        }
        await batch.commit();
        // Clear successfully synced items
        await this.setQueue([]);
      }
    } catch (e) {
      console.error("[VibeSyncEngine] Sync failed:", e);
    } finally {
      this.isSyncing = false;
    }
  }

  async pullFromFirestore() {
    const user = store.getCurrentUser() || auth.currentUser;
    if (!user) return;
    const uid = typeof user === 'string' ? user : (user as any).uid || (user as any).id;
    if (!uid) return;
    
    try {
      // Pull Decks
      const q = query(collection(db, "vibe_decks"), where("ownerId", "==", uid));
      const snap = await getDocs(q);
      const remoteDecks: Deck[] = [];
      snap.forEach(d => remoteDecks.push({ id: d.id, ...d.data() } as Deck));
      
      for (const deck of remoteDecks) {
        // Conflict resolution: keep whichever is newer
        const local = await get(`vibe_deck_${deck.id}`) as any;
        if (!local || !local.lastUpdatedAt || (deck as any).lastUpdatedAt > local.lastUpdatedAt) {
           await set(`vibe_deck_${deck.id}`, deck);
        }
      }

      // Pull Profile
      const pDoc = await getDoc(doc(db, "users", uid));
      if (pDoc.exists()) {
         const remoteProfile = pDoc.data();
         const localProfile = await get(`vibe_profile_${uid}`) as any;
         if (!localProfile || !localProfile.lastUpdatedAt || remoteProfile.lastUpdatedAt > localProfile.lastUpdatedAt) {
            await set(`vibe_profile_${uid}`, remoteProfile);
         }
      }
      
      this.notify();
    } catch (e) {
      console.error("[VibeSyncEngine] Pull failed:", e);
    }
  }

  // --- Local IDB Access for UI ---

  async getLocalDecks(): Promise<Deck[]> {
    const allKeys = await keys();
    const deckKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith("vibe_deck_"));
    const localDecks: Deck[] = [];
    for (const k of deckKeys) {
      const d = await get(k as string);
      if (d) localDecks.push(d as Deck);
    }
    
    const systemDecks = store.getDecks().filter(d => 
       ["deck_1", "deck_phil_2", "deck_math_1", "deck_math_2", "deck_physics_1", "deck_physics_2", "deck_test_ui", "deck_formatting_test", "daily-quest", "remind-later-deck"].includes(d.id)
    );
    
    return [...systemDecks, ...localDecks];
  }

  async getDeck(deckId: string): Promise<Deck | null> {
    const d = await get(`vibe_deck_${deckId}`);
    if (d) return d as Deck;
    return store.getDeck(deckId) || null;
  }

  async saveDeck(deck: Deck) {
    const timestamp = Date.now();
    await set(`vibe_deck_${deck.id}`, { ...deck, lastUpdatedAt: timestamp });
    await this.enqueueChange({ type: "UPSERT_DECK", payload: deck });
    this.notify();
  }

  async deleteDeck(deckId: string) {
    await del(`vibe_deck_${deckId}`);
    await this.enqueueChange({ type: "DELETE_DECK", payload: { id: deckId } });
    this.notify();
  }
  
  async updateCard(deckId: string, cardId: string, updates: any) {
     const deck = await get<Deck>(`vibe_deck_${deckId}`);
     if (deck && deck.cards) {
         deck.cards = deck.cards.map(c => c.id === cardId ? { ...c, ...updates } : c);
         await this.saveDeck(deck);
     }
  }

  async saveProfile(uid: string, updates: any) {
    const timestamp = Date.now();
    const current = await get(`vibe_profile_${uid}`) || {};
    const merged = { ...current, ...updates, lastUpdatedAt: timestamp };
    await set(`vibe_profile_${uid}`, merged);
    await this.enqueueChange({ type: "UPSERT_PROFILE", payload: { id: uid, ...merged } });
    this.notify();
  }
}

export const VibeSyncEngine = new SyncEngineClass();
