"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type CartItem = {
  id: string; // unique cart item id
  productId: string;
  name: string;
  unitPrice: number;
  image: string;
  quantity: number;
  attributes?: Record<string, any>;
};

type CartContextType = {
  items: CartItem[];
  isOpen: boolean;
  subtotal: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      if (stored) setItems(JSON.parse(stored));
    } catch (err) {
      console.warn("Failed to load cart from localStorage", err);
    }
  }, []);

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to save cart to localStorage", err);
    }
  }, [items]);

  // Drawer controls
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  // Add or merge item into cart
  const addItem = useCallback(
    (item: Omit<CartItem, "id" | "quantity">) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.productId === item.productId &&
            JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
        );

        if (existing) {
          return prev.map((i) =>
            i.id === existing.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }

        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            quantity: 1,
            ...item,
          },
        ];
      });

      setIsOpen(true); // automatically open drawer
    },
    []
  );

  // Update quantity
  const updateQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, qty) } : i
      )
    );
  }, []);

  // Remove item
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Clear cart
  const clear = useCallback(() => setItems([]), []);

  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        subtotal,
        open,
        close,
        toggle,
        addItem,
        updateQuantity,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook to access cart
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}