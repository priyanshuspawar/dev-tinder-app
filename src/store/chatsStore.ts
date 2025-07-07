import { Message } from "@/queries/chatQueries";
import { create } from "zustand";

type SocketMsg = {
  tempId: string;
  _id: string;
  chatId: string;
  senderId: string;
  content: {
    type: "text" | "image" | "file";
    text?: string;
    uri?: string;
  };
  createdAt: string;
  status: "sent" | "delivered" | "read";
};
interface ChatStore {
  chats: Record<string, Message[]>;
  initilizeChatMessages: ({
    chatId,
    messages,
  }: {
    chatId: string;
    messages: Message[];
  }) => void;
  addChat: (ChatId: string, messages: Message[]) => void;
  addMessageToChatBefore: (ChatId: string, messages: Message[]) => void;
  addMessageToChatAfter: (ChatId: string, messages: Message[]) => void;
  updateMessageOfChat: (ChatId: string, socketMsg: SocketMsg) => void;
  updateMessageStatus: (
    chatId: string,
    message: { _id: string } & Partial<Omit<Message, "_id">>
  ) => void;
  removeAllChats: () => void;
}

const useChatsStore = create<ChatStore>((set, get) => ({
  chats: {},

  addChat(ChatId, messages) {
    set((state) => ({
      chats: {
        ...state.chats,
        [ChatId]: messages,
      },
    }));
  },

  initilizeChatMessages({ messages, chatId }) {
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: messages,
      },
    }));
  },

  addMessageToChatAfter(ChatId, messages) {
    const state = get();
    const prevChats = state.chats[ChatId];
    if (!prevChats) return;

    set((state) => ({
      chats: {
        ...state.chats,
        [ChatId]: [...prevChats, ...messages],
      },
    }));
  },

  addMessageToChatBefore(ChatId, messages) {
    const state = get();
    const prevChats = state.chats[ChatId];
    if (!prevChats) return;

    set((state) => ({
      chats: {
        ...state.chats,
        [ChatId]: [...messages, ...prevChats],
      },
    }));
  },
  updateMessageOfChat(ChatId, socketMsg) {
    const state = get();
    const prevChats = state.chats[ChatId];
    if (!prevChats) return;
    let update = prevChats;
    update = prevChats.map((msg) =>
      msg._id === socketMsg.tempId
        ? {
            ...socketMsg,
            _id: socketMsg._id,
            isUnread: socketMsg.status != "read",
            isSentByCurrentUser: true,
          }
        : msg
    );
    set((state) => ({
      chats: {
        ...state.chats,
        [ChatId]: update,
      },
    }));
  },
  updateMessageStatus(chatId, message) {
    const state = get();
    const prevChats = state.chats[chatId];
    if (!prevChats) return;
    let update = prevChats;
    update = prevChats.map((msg) =>
      msg._id === message._id
        ? {
            ...msg,
            ...message,
          }
        : msg
    );
    set((state) => ({
      chats: {
        ...state.chats,
        [chatId]: update,
      },
    }));
  },
  removeAllChats: () => {
    set({
      chats: {},
    });
  },
}));

export default useChatsStore;
