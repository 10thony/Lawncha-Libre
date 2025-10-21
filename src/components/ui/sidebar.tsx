import * as React from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

interface SidebarItemProps {
  children?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Sidebar.displayName = "Sidebar";

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarContent.displayName = "SidebarContent";

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4 border-b border-gray-200 dark:border-gray-700", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("p-4 border-t border-gray-200 dark:border-gray-700", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarFooter.displayName = "SidebarFooter";

const SidebarToggle = React.forwardRef<HTMLButtonElement, SidebarToggleProps>(
  ({ isCollapsed, onToggle, className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200",
          className
        )}
        {...props}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
        <span className="sr-only">
          {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        </span>
      </Button>
    );
  }
);
SidebarToggle.displayName = "SidebarToggle";

const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ children, isActive, onClick, className, icon, label, isCollapsed, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700",
          isActive && "bg-primary/10 text-primary border-r-2 border-primary",
          !isActive && "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
          isCollapsed && "justify-center px-2",
          className
        )}
        {...props}
      >
        {icon && (
          <span className={cn("flex-shrink-0", isCollapsed && "mx-auto")}>
            {icon}
          </span>
        )}
        {!isCollapsed && (
          <span className="truncate">{label}</span>
        )}
        {children}
      </button>
    );
  }
);
SidebarItem.displayName = "SidebarItem";

const SidebarGroup = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 overflow-y-auto", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SidebarGroup.displayName = "SidebarGroup";

const SidebarSection = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; title?: string }>(
  ({ children, className, title, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("px-2 py-2", className)}
        {...props}
      >
        {title && (
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </h3>
        )}
        <div className="space-y-1">
          {children}
        </div>
      </div>
    );
  }
);
SidebarSection.displayName = "SidebarSection";

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarToggle,
  SidebarItem,
  SidebarGroup,
  SidebarSection,
};
