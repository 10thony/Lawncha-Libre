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
          "lg:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200",
          className
        )}
        {...props}
      >
        {isOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
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
