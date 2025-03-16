import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type CardSwipeDirection = "left" | "right";
export type IsDragOffBoundary = "left" | "right" | null;
