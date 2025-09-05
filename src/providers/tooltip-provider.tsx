import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

export const TooltipText = ({
  children,
  value,
  className,
  sideOffset,
  align,
  side,
  delay,
}: {
  className?: string;
  sideOffset?: number;
  children: ReactNode;
  align?: "center" | "end" | "start";
  side?: "top" | "bottom" | "left" | "right";
  value: ReactNode;
  delay?: number;
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delay}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          align={align}
          side={side}
          className={className}
          sideOffset={sideOffset}
        >
          {value}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
