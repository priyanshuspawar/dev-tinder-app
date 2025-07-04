import useChatsStore from "@/store/chatsStore";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import dayjs from "dayjs";
import { useWindowSize } from "usehooks-ts";

const ChatScroller = ({
  chatId,
  fetchAfter,
  fetchBefore,
  isAnchored,
}: {
  chatId: string;
  isAnchored?: boolean;
  fetchAfter: () => void;
  fetchBefore: () => void;
}) => {
  const { chats } = useChatsStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const upRef = useRef<HTMLDivElement>(null);
  const downRef = useRef<HTMLDivElement>(null);
  const upInview = useInView(upRef, {
    root: scrollRef,
    amount: 0.4,
    margin: "4px",
  });
  const downInView = useInView(downRef, {
    root: scrollRef,
    amount: 0.4,
    margin: "4px",
  });
  const didMountRef = useRef(false);
  const isInitializedRef = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout>();

  // Track when messages are actually loaded and rendered
  useEffect(() => {
    if (
      chats[chatId] &&
      chats[chatId].length > 0 &&
      !isInitializedRef.current
    ) {
      // Add a small delay to ensure DOM is fully rendered before enabling fetch triggers
      initTimeoutRef.current = setTimeout(() => {
        isInitializedRef.current = true;
      }, 100);
    }

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [chats[chatId]]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }
    if (upInview && !downInView) {
      fetchBefore();
      console.log("fetch before");
    }
    if (downInView && !upInview) {
      fetchAfter();
      console.log("fetch after");
    }
  }, [upInview, downInView]);
  const { width = 0, height = 0 } = useWindowSize();
  // Fixed scroll to top logic for flex-col-reverse
  useEffect(() => {
    if (isAnchored && scrollRef.current) {
      // For flex-col-reverse, scroll to the maximum scroll position (bottom of scroll area)
      // which visually appears as the "top" due to the reverse layout
      const scrollContainer = scrollRef.current;

      let scrollval = scrollContainer.scrollHeight - 380;
      console.log(height, scrollval);
      scrollContainer.scrollTo({
        top: -scrollval,
        behavior: "instant",
      });
      didMountRef.current = true;
    }
  }, [isAnchored]);

  return (
    <div
      ref={scrollRef}
      className="h-full flex flex-col-reverse overflow-x-hidden w-full bg-default-50 overflow-y-scroll"
    >
      <div ref={downRef} className="" />

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ root: scrollRef }}
        className="flex flex-col"
      >
        {chats[chatId] &&
          chats[chatId].map((msg, idx) => {
            const currentMsgDate = dayjs(msg.createdAt).startOf("day");
            const prevMsg = chats[chatId][idx - 1];
            const prevMsgDate = prevMsg
              ? dayjs(prevMsg.createdAt).startOf("day")
              : null;
            let showLabel = false;
            let showUnreadLabel = false;
            if (!prevMsgDate || !currentMsgDate.isSame(prevMsgDate)) {
              showLabel = true;
            }
            if (prevMsg?.isUnread != msg?.isUnread) {
              showUnreadLabel = true;
            }
            const endOfStack =
              !chats[chatId][idx + 1] ||
              chats[chatId][idx + 1].senderId !== msg.senderId;
            return (
              <MessageBubble
                isEndOfStack={endOfStack}
                containerRef={scrollRef}
                showUnread={showUnreadLabel}
                showDivider={showLabel}
                key={msg._id}
                message={msg}
              />
            );
          })}
      </motion.div>
      <div ref={upRef} />
    </div>
  );
};

export default ChatScroller;
