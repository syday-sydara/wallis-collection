import * as React from "react";
import { cn } from "@/lib/cn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "cmdk";
import { Check, ChevronDown } from "lucide-react";

interface ComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Select…",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-border bg-bg px-3 text-text-primary",
          "focus:outline-none focus:ring-2 focus:ring-brand"
        )}
      >
        {value ? options.find((o) => o.value === value)?.label : placeholder}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-dropdown mt-1 w-full rounded-md border border-border bg-bg shadow-md">
          <Command>
            <CommandInput placeholder="Search…" />
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </div>
      )}
    </div>
  );
}
