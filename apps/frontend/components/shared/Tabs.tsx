import * as React from "react";
import { cn } from "@/lib/cn";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = (v: string) => {
    if (!isControlled) setInternalValue(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue!, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/* -----------------------------------------------------
   Tabs List
----------------------------------------------------- */

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-2 border-b border-border", className)}
      {...props}
    />
  );
}

/* -----------------------------------------------------
   Tabs Trigger
----------------------------------------------------- */

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be inside <Tabs>");

  const selected = ctx.value === value;

  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "px-3 py-2 text-sm rounded-md transition-colors",
        selected
          ? "text-text font-medium border-b-2 border-primary"
          : "text-text-muted hover:text-text",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* -----------------------------------------------------
   Tabs Content
----------------------------------------------------- */

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be inside <Tabs>");

  if (ctx.value !== value) return null;

  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}
