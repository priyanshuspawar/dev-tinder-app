import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isSameOrBefore);

// ---------- Types ----------
export interface RawMessage {
  _id: string;
  senderId: string;
  createdAt: string;
  status?: string;
  isUnread?: boolean;
  content?: {
    text?: string;
    type?: string;
  };
}

export interface ProcessedMessage {
  id: string;
  text: string;
  time: string;
  relativeTime: string;
  status?: string;
  isUnread: boolean;
  isSentByMe: boolean;
  senderId: string;
  timestamp: number;
  type: string;
}

export interface MessageGroup {
  dateLabel: string;
  date: string;
  messages: ProcessedMessage[];
}

export interface ChatSummary {
  lastMessage: {
    text: string;
    time: string;
    relativeTime: string;
    isSentByMe: boolean;
  };
  unreadCount: number;
  hasUnread: boolean;
  lastActivity: number;
}

export interface UnreadStats {
  count: number;
  hasUnread: boolean;
  firstUnreadId: string | null;
  lastUnreadTime: string | null;
}

// ---------- Class ----------
export class MessageProcessor {
  private currentUserId: string;

  constructor(currentUserId: string) {
    this.currentUserId = currentUserId;
  }

  getDateLabel(dateString: string): string {
    const messageDate = dayjs(dateString);

    if (messageDate.isToday()) return "Today";
    if (messageDate.isYesterday()) return "Yesterday";

    if (messageDate.isSameOrBefore(dayjs(), "week")) {
      return messageDate.format("dddd");
    }

    if (messageDate.isSame(dayjs(), "year")) {
      return messageDate.format("MMM D");
    }

    return messageDate.format("MMM D, YYYY");
  }

  formatTime(dateString: string): string {
    return dayjs(dateString).format("HH:mm");
  }

  getRelativeTime(dateString: string): string {
    return dayjs(dateString).fromNow();
  }

  processMessage(message: RawMessage): ProcessedMessage {
    return {
      id: message._id,
      text: message.content?.text || "",
      time: this.formatTime(message.createdAt),
      relativeTime: this.getRelativeTime(message.createdAt),
      status: message.status,
      isUnread: message.isUnread ?? false,
      isSentByMe: message.senderId === this.currentUserId,
      senderId: message.senderId,
      timestamp: dayjs(message.createdAt).valueOf(),
      type: message.content?.type || "text",
    };
  }

  processMessages(rawMessages: RawMessage[]): MessageGroup[] {
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return [];
    }

    const sortedMessages = [...rawMessages].sort(
      (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()
    );

    const messageGroups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    for (const message of sortedMessages) {
      const processedMessage = this.processMessage(message);
      const dateLabel = this.getDateLabel(message.createdAt);

      if (!currentGroup || currentGroup.dateLabel !== dateLabel) {
        currentGroup = {
          dateLabel,
          date: dayjs(message.createdAt).format("YYYY-MM-DD"),
          messages: [],
        };
        messageGroups.push(currentGroup);
      }

      currentGroup.messages.push(processedMessage);
    }

    return messageGroups;
  }

  getUnreadStats(messages: ProcessedMessage[]): UnreadStats {
    const unreadMessages = messages.filter(
      (msg) => msg.isUnread && !msg.isSentByMe
    );

    return {
      count: unreadMessages.length,
      hasUnread: unreadMessages.length > 0,
      firstUnreadId: unreadMessages[0]?.id ?? null,
      lastUnreadTime:
        unreadMessages[unreadMessages.length - 1]?.relativeTime ?? null,
    };
  }

  markAllAsRead(messageGroups: MessageGroup[]): MessageGroup[] {
    return messageGroups.map((group) => ({
      ...group,
      messages: group.messages.map((msg) => ({
        ...msg,
        isUnread: msg.isSentByMe ? msg.isUnread : false,
      })),
    }));
  }

  getChatSummary(rawMessages: RawMessage[]): ChatSummary | null {
    if (!rawMessages.length) return null;

    const sortedMessages = [...rawMessages].sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    );

    const lastMessage = sortedMessages[0];
    const unreadCount = rawMessages.filter(
      (msg) => msg.isUnread && msg.senderId !== this.currentUserId
    ).length;

    return {
      lastMessage: {
        text: lastMessage.content?.text || "",
        time: this.formatTime(lastMessage.createdAt),
        relativeTime: this.getRelativeTime(lastMessage.createdAt),
        isSentByMe: lastMessage.senderId === this.currentUserId,
      },
      unreadCount,
      hasUnread: unreadCount > 0,
      lastActivity: dayjs(lastMessage.createdAt).valueOf(),
    };
  }
}

// ---------- Hook ----------
export const useMessageProcessor = (currentUserId: string) => {
  const processor = new MessageProcessor(currentUserId);

  return {
    processMessages: (messages: RawMessage[]) =>
      processor.processMessages(messages),
    getUnreadStats: (messages: ProcessedMessage[]) =>
      processor.getUnreadStats(messages),
    markAllAsRead: (groups: MessageGroup[]) => processor.markAllAsRead(groups),
    getChatSummary: (messages: RawMessage[]) =>
      processor.getChatSummary(messages),
    formatTime: (date: string) => processor.formatTime(date),
    getRelativeTime: (date: string) => processor.getRelativeTime(date),
  };
};
