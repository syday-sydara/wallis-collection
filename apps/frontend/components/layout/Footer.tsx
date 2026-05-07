import * as React from "react";
import { cn } from "@/lib/cn";

export interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Footer({ className, children, ...props }: FooterProps) {
  return (
    <div className="p-4 border-b bg-white">
      <span className="text-gray-500">Footer</span>
    </div>
  );
}
