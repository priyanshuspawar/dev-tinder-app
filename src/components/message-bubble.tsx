import { Message } from "@/queries/chatQueries";
import useAuthStore from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import useSocket from "@/store/socketStore";
import { getFormattedDate, msgTimeFormater } from "@/utils/helpers";
import clsx from "clsx";
import { useInView } from "framer-motion";
import { Check, CheckCheck, Clock, Triangle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const MessageBubble = ({
  message,
  showDivider,
  showUnread,
  containerRef,
  isEndOfStack,
}: {
  message: Message;
  containerRef: React.RefObject<HTMLDivElement>;
  showDivider?: boolean;
  showUnread?: boolean;
  isEndOfStack?: boolean;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    root: containerRef,
  });
  const { user } = useAuthStore();
  const { connectionId } = useParams<{ connectionId: string }>();
  const { removeFromNotification } = useNotificationStore();
  const { socket } = useSocket();
  useEffect(() => {
    if (
      user?._id != message.senderId &&
      message.isUnread &&
      isInView &&
      socket
    ) {
      removeFromNotification(connectionId!, message._id);
      socket.emit("messageRead", {
        messageId: message._id,
        chatId: message.chatId,
      });
    }
  }, [isInView]);
  return (
    <div ref={ref} className="px-2">
      {showDivider && (
        <div className="w-full flex justify-center">
          <span className="text-sm bg-default-100 px-2 py-1 rounded-lg">
            {getFormattedDate(message.createdAt)}
          </span>
        </div>
      )}
      {!message.isSentByCurrentUser && message.isUnread && showUnread && (
        <div className="w-full my-2 flex justify-center bg-default-100">
          <span className="text-sm bg-background2 text-primary-500 px-2 py-1 rounded-lg">
            Unread
          </span>
        </div>
      )}

      <div
        className={clsx(
          "w-full flex my-2 items-end",
          message.isSentByCurrentUser ? "justify-end" : "justify-start"
        )}
      >
        <div className="flex relative">
          <div
            className={clsx(
              "px-2 py-2 w-fit items-end flex gap-1 ",
              message.isSentByCurrentUser
                ? "bg-primary-100 rounded-t-lg rounded-bl-lg"
                : "bg-default-200 rounded-t-lg rounded-br-lg"
            )}
          >
            <p className="w-full text-left">{message.content.text}</p>

            <span className="text-[0.55rem] text-default-600 flex gap-0.5 items-center flex-shrink-0">
              {msgTimeFormater(message.createdAt)}
              {message.isSentByCurrentUser && (
                <StatusIcon status={message.status} />
              )}
            </span>
          </div>
          {isEndOfStack && (
            <Triangle
              className={clsx(
                "w-2 absolute h-2 rotate-[95] bottom-0",
                message.isSentByCurrentUser
                  ? "text-primary-100 fill-primary-100 -right-0.5"
                  : "text-default-200 fill-default-200 -left-0.5"
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

const StatusIcon = ({ status }: { status?: "read" | "sent" | "delivered" }) => {
  switch (status) {
    case "read":
      return <CheckCheck className="w-3 h-3 text-sky-500" />;
    case "delivered":
      return <CheckCheck className="w-3 h-3" />;
    case "sent":
      return <Check className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};
