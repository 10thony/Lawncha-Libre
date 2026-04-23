import * as React from "react";
import { Button } from "./button";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface MobileSidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const MobileSidebarToggle = React.forwardRef<HTMLButtonElement, MobileSidebarToggleProps>(
  ({ isOpen, onToggle, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(
          "lg:hidden fixed top-3 left-3 sm:top-4 sm:left-4 z-50 h-10 w-10 border border-border bg-card/95 backdrop-blur-sm hover:bg-accent hover:border-primary transition-all duration-150",
          className
        )}
        {...props}
      >
        {isOpen ? (
          <X className="h-3.5 w-3.5 text-secondary-foreground" />
        ) : (
          <Menu className="h-3.5 w-3.5 text-secondary-foreground" />
        )}
        <span className="sr-only">
          {isOpen ? "Close sidebar" : "Open sidebar"}
        </span>
      </Button>
    );
  }
);
MobileSidebarToggle.displayName = "MobileSidebarToggle";

export { MobileSidebarToggle };
