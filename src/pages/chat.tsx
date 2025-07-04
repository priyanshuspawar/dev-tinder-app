import ChatHeader from "@/components/chat-header";
import ChatScroller from "@/components/chat-scroller";
import SendMessageBar from "@/components/send-message-bar";
import {
  chatinitData,
  getMessageOfChat,
  Pagination,
} from "@/queries/chatQueries";
import useAuthStore from "@/store/authStore";
import useChatsStore from "@/store/chatsStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Spinner } from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Chat = () => {
  const { connectionId } = useParams();
  const [isLoading, setIsloading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { newChatMessages } = useNotificationStore();
  const { chats } = useChatsStore();

  const [pagination, setPagination] = useState<Pagination>();
  const limit = 20;
  const { data: chatInfo } = useQuery({
    queryKey: ["chatInfo"],
    queryFn: () => chatinitData(connectionId!),
    staleTime: 1000 * 60 * 20,
  });

  const {
    initilizeChatMessages,
    addMessageToChatAfter,
    addMessageToChatBefore,
  } = useChatsStore();
  const queryClient = useQueryClient();
  const notificationsMessages = newChatMessages[connectionId!];
  const { user } = useAuthStore();
  useEffect(() => {
    let chatId = chatInfo?.data.chatId;

    if (chatId) {
      (async () => {
        //check any notifications first
        try {
          const thereAreNotifications = notificationsMessages?.length > 0;
          //fetch first messages
          const data = await queryClient.fetchQuery({
            queryKey: ["messages", chatId],
            queryFn: () => {
              return thereAreNotifications
                ? getMessageOfChat({
                    chatId,
                    limit,
                    loadType: "unread",
                  })
                : getMessageOfChat({
                    chatId,
                    limit,
                    loadType: "recent",
                  });
            },
          });
          setPagination(data.pagination);
          initilizeChatMessages({
            chatId,
            messages: data.data,
          });
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message);
          }
          setError("An unknown error occured");
          console.error(error);
        } finally {
          setIsloading(false);
        }
      })();
    }
  }, [chatInfo]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <Spinner />
      </div>
    );
  }
  if (!chatInfo || !pagination || error) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        {" "}
        <span>Error Failed to load chats </span>
      </div>
    );
  }
  const chatId = chatInfo.data.chatId;

  const fetchAfter = async () => {
    const chat = chats[chatId];
    if (chats[chatId][chat.length - 1]._id != pagination.hasMoreAfter?.cursor)
      return;
    const cursor = pagination.hasMoreAfter?.cursor;
    if (!pagination.hasMoreAfter || !cursor) return;

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ["messages", chatId, cursor, "after"],
        queryFn: () => {
          return getMessageOfChat({ chatId, cursor, direction: "after" });
        },
      });
      addMessageToChatAfter(chatId, res.data);
      setPagination(res.pagination);
    } catch {
      alert("failed to load messages after");
    }
  };

  const fetchBefore = async () => {
    if (chats[chatId][0]._id != pagination.hasMoreBefore?.cursor) return;
    const cursor = pagination.hasMoreBefore?.cursor;
    if (!pagination.hasMoreBefore || !cursor) return;
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ["messages", chatId, cursor, "before"],
        queryFn: () => {
          return getMessageOfChat({
            chatId,
            cursor,
            direction: "before",
            limit,
          });
        },
      });
      addMessageToChatBefore(chatId, res.data);
      setPagination(res.pagination);
    } catch {
      alert("failed to load messages before");
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <ChatHeader
        otherUserId={
          chatInfo.data.participants?.filter(
            (users) => users._id != user?._id
          )[0]._id
        }
      />
      <ChatScroller
        chatId={chatId}
        fetchAfter={fetchAfter}
        // Pass true when there are notification messages (unread messages)
        isAnchored={!!notificationsMessages?.length}
        fetchBefore={fetchBefore}
      />
      <SendMessageBar chatId={chatInfo.data.chatId} />
    </div>
  );
};

export default Chat;
