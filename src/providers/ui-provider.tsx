import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/react";
import { useHref, useNavigate } from "react-router-dom";
import { ToastProvider } from "@heroui/toast";
import { useMediaQuery } from "usehooks-ts";
declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isMobileDevices = useMediaQuery("(max-width: 895px)");
  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider
        placement={isMobileDevices ? "top-center" : "bottom-right"}
      />
      {children}
    </HeroUIProvider>
  );
}
