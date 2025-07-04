import { Message } from "@/queries/chatQueries";
import useAuthStore from "@/store/authStore";
import useChatsStore from "@/store/chatsStore";
import { useNotificationStore } from "@/store/notificationStore";
import useSocket from "@/store/socketStore";

type ServerMessage = {
  _id: string;
  chatId: string;
  senderId: string;
  content: {
    type: "text" | "image" | "file";
    text?: string;
    uri?: string;
  };
  createdAt: string;
  updatedAt: string;
  referenceMessageId?: string;
  status: "sent" | "delivered" | "read";
  //extras
  connectionId?: string;
  isUnread?: boolean;
  isSentByCurrentUser?: boolean;
};
type chatUpdate = {
  type: "read-status" | "receive-message";
  chatId: string;
  message: ServerMessage;
};

export const handleChatUpdate = ({ type, chatId, message }: chatUpdate) => {
  const { chats, updateMessageStatus, addMessageToChatAfter } = useChatsStore();
  const { addNewChatMessages } = useNotificationStore();
  const { user } = useAuthStore();
  const { socket } = useSocket();
  if (chats[chatId] || !user || !socket) return;
  switch (type) {
    case "read-status":
      updateMessageStatus(chatId, { ...message });
      break;
    case "receive-message":
      if (
        !message.isSentByCurrentUser ||
        !message.isUnread ||
        !message.connectionId
      )
        return;
      if (window.location.pathname.startsWith("/dashboard/chat/")) {
        addMessageToChatAfter(message.chatId, [
          {
            ...message,
            isUnread: message.isUnread,
            isSentByCurrentUser: message.isSentByCurrentUser,
          },
        ]);
      }
      addNewChatMessages({ [message.connectionId]: [message as Message] });
      updateMessageStatus(chatId, { ...message });
      // 🔁 Emit delivered status
      socket.emit("messageReceivedAck", {
        messageId: message._id,
        chatId: message.chatId,
        status: "delivered",
      });
      break;
  }
};
