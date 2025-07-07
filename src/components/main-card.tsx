import React from "react";
import { ScrollShadow } from "@heroui/react";
import { cn } from "@/utils/helpers";
const MainCard = ({
  cardHeader,
  children,
  scrollEnable = true,
}: {
  cardHeader: React.ReactNode;
  scrollEnable?: boolean;
  children?: React.ReactNode;
  isOpen?: boolean; // Add this prop to pass the submitForm function from parent component.
}) => {
  return (
    <ScrollShadow
      visibility="none"
      className={cn(
        "relative w-full h-screen scrollbar-hide",
        scrollEnable ? "overflow-y-scroll" : "overflow-y-hidden"
      )}
    >
      {/* Card Header */}
      <div className="flex w-full h-[6vh] bg-secondary-100 items-center sticky top-0 z-10">
        {cardHeader}
      </div>

      {/* Card Content */}
      {children}
    </ScrollShadow>
  );
};

export default MainCard;
