import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { SignUp } from "@clerk/react";
import { clerkAuthAppearance, clerkAuthLocalization, SignInForm } from "../../SignInForm";

const postAuthUrl =
  typeof window !== "undefined" ? `${window.location.origin}/` : "/";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg", 
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-7xl"
};

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  className,
  size = "md"
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (!isOpen) return;

    const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
    if (modalElement) {
      modalElement.focus();
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/85 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className={cn(
          "relative w-full bg-card",
          "border border-border",
          "animate-fade-in max-h-[90vh] overflow-y-auto",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex-1">
              {title && (
                <h2 id="modal-title" className="text-base font-bold text-card-foreground tracking-wide uppercase">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 p-2 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "signin" | "signup";
  onModeChange: (mode: "signin" | "signup") => void;
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      className="max-h-[85vh]"
    >
      <div className="space-y-6">
        <div className="flex bg-background border border-border">
          <button
            onClick={() => onModeChange("signin")}
            className={cn(
              "flex-1 py-2 px-4 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-150",
              mode === "signin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-secondary-foreground hover:bg-accent"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => onModeChange("signup")}
            className={cn(
              "flex-1 py-2 px-4 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-150",
              mode === "signup"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-secondary-foreground hover:bg-accent"
            )}
          >
            Sign Up
          </button>
        </div>

        <div className="min-h-[400px]">
          {mode === "signin" ? (
            <SignInForm forceRedirectUrl={postAuthUrl} />
          ) : (
            <div className="w-full flex justify-center">
              <SignUp
                forceRedirectUrl={postAuthUrl}
                signInForceRedirectUrl={postAuthUrl}
                appearance={clerkAuthAppearance}
                localization={clerkAuthLocalization}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
