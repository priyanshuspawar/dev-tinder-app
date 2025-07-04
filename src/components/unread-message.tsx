import { useInView } from "framer-motion";
import React, { useEffect, useRef } from "react";

const UnreadMessageInview = ({
  id,
  containerRef,
  children,
}: {
  id: string;
  containerRef: React.RefObject<Element | null>;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, {
    root: containerRef,
    amount: 0.5,
  });

  useEffect(() => {
    if (inView) {
      console.log(`Message ${id} is in view`);
      // Here you can add logic to mark message as read
      // For example: markMessageAsRead(id);
    }
  }, [inView, id]);

  // IMPORTANT: Attach the ref to the actual DOM element
  return <div ref={ref}>{children}</div>;
};

export default UnreadMessageInview;
