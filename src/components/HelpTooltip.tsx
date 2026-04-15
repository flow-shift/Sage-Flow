import { useState } from "react";
import { HelpCircle } from "lucide-react";

export const HelpTooltip = ({ content }: { content: string }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-block ml-1">
      <HelpCircle
        className="w-4 h-4 text-muted-foreground cursor-help inline-block"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      />
      {visible && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-6 z-50 w-64 bg-popover text-popover-foreground text-xs rounded-lg px-3 py-2 shadow-lg border">
          {content}
        </span>
      )}
    </span>
  );
};
