import axios from "axios";

export type Message = {
  _id: string;
  chatId: string;
  senderId: string;
  content: {
    type: "text" | "image" | "file";
    text?: string;
    uri?: string;
  };
  createdAt: string;
  updatedAt?: string;
  referenceMessageId?: string;
  status?: "sent" | "delivered" | "read";
  isUnread: boolean;
  isSentByCurrentUser: boolean;
};

export type initilizeChatResponse = {
  data: {
    chatId: string;
    participants: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar: {
        imgUrl: string;
        _id: string;
      };
    }[];
  };
};

export interface MessageGroup {
  date: string;
  displayDate: string;
  messages: Array<{
    _id: string;
    chatId: string;
    content: { text: string; type: string };
    createdAt: string;
    senderId: string;
    status: string;
    updatedAt: string;
  }>;
}

export interface ChatResponse {
  chatId: string;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    avatar: { imgUrl: string };
  }>;
  messageGroups: MessageGroup[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const chatinitData = async (connectionId: string) => {
  const res = await axios.get<initilizeChatResponse>(
    `${import.meta.env.VITE_API_URL}/chat/initilize/${connectionId}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

type getMessageProps = {
  chatId: string;
  cursor?: string; // anchor message
  direction?: "after" | "before"; // direction of message by date of anchor message
  limit?: number; //number of message per request
  loadType?: "recent" | "unread" | "around";
};

export type Pagination = {
  hasMoreBefore: {
    cursor: string;
  } | null;
  hasMoreAfter: {
    cursor: string;
  } | null;
};

type getMessageResponse = {
  data: Message[];
  pagination: Pagination;
  chatInfo: {
    unreadCount: number;
    totalMessages: number;
  };
};
export const getMessageOfChat = async ({
  chatId,
  cursor,
  direction,
  limit,
  loadType,
}: getMessageProps) => {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (direction) params.append("direction", direction);
  if (limit) params.append("limit", limit.toString());
  if (loadType) params.append("loadType", loadType);

  const url = `${import.meta.env.VITE_API_URL}/chat/${chatId}/messages?${params.toString()}`;
  const res = await axios.get<getMessageResponse>(url, {
    withCredentials: true,
  });
  return res.data;
};
