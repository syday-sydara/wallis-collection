import * as React from "react";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "framer-motion";

type DrawerSide = "left" | "right" | "bottom";

interface DrawerContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  side: DrawerSide;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: DrawerSide;
  children: React.ReactNode;
}

export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  side = "right",
  children,
}: DrawerProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);

  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = (v: boolean) => {
    if (!isControlled) setInternalOpen(v);
    onOpenChange?.(v);
  };

  return (
    <DrawerContext.Provider value={{ open: currentOpen, setOpen, side }}>
      {children}
    </DrawerContext.Provider>
  );
}

/* -----------------------------------------------------
   Drawer Trigger
----------------------------------------------------- */

export interface DrawerTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function DrawerTrigger({ children, ...props }: DrawerTriggerProps) {
  const ctx = React.useContext(DrawerContext);
  if (!ctx) throw new Error("DrawerTrigger must be inside <Drawer>");

  return (
    <button onClick={() => ctx.setOpen(true)} {...props}>
      {children}
    </button>
  );
}

/* -----------------------------------------------------
   Drawer Content
----------------------------------------------------- */

export interface DrawerContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function DrawerContent({ className, children, ...props }: DrawerContentProps) {
  const ctx = React.useContext(DrawerContext);
  if (!ctx) throw new Error("DrawerContent must be inside <Drawer>");

  const { open, setOpen, side } = ctx;

  // ESC key to close
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  // Animation variants
  const variants = {
    right: { x: "100%" },
    left: { x: "-100%" },
    bottom: { y: "100%" },
  };

  const animateTo = {
    right: { x: 0 },
    left: { x: 0 },
    bottom: { y: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-overlay"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Drawer Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed z-overlay bg-bg shadow-xl p-6",
              side === "right" && "top-0 right-0 h-full w-80",
              side === "left" && "top-0 left-0 h-full w-80",
              side === "bottom" && "left-0 bottom-0 w-full h-64",
              className
            )}
            initial={variants[side]}
            animate={animateTo[side]}
            exit={variants[side]}
            transition={{ type: "spring", damping: 20, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
