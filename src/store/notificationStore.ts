import { Message } from "@/queries/chatQueries";
import { create } from "zustand";

type NotificationStore = {
  newRequests: [];
  newChatMessages: Record<string, Message[]>;
  addNewChatMessages: (record: Record<string, Message[]>) => void;
  removeFromNotification: (connectionId: string, messageId: string) => void;
};

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  newRequests: [],
  newChatMessages: {},
  addNewChatMessages: (record) => {
    let update = get().newChatMessages;
    Object.entries(record).forEach(([chatId, messages]) => {
      // Merge new messages with existing ones, avoiding duplicates by _id
      const existing = update[chatId] || [];
      const existingIds = new Set(existing.map((m) => m._id));
      const merged = [
        ...existing,
        ...messages.filter((m) => !existingIds.has(m._id)),
      ];
      update[chatId] = merged;
    });
    set({
      newChatMessages: update,
    });
  },
  removeFromNotification: (connectionId, messageId) => {
    let update = get().newChatMessages;
    update[connectionId] = update[connectionId].filter(
      (msg) => msg._id != messageId
    );
    if (update[connectionId].length === 0) {
      delete update[connectionId];
    }
    set({
      newChatMessages: update,
    });
  },
}));
