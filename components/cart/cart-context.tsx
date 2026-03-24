"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

/* --------------------------------------------- */
/* Types                                         */
/* --------------------------------------------- */

export interface CartItem {
  id: string; // product ID
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variants?: Record<string, string>; // e.g. { size: "M", color: "Black" }
  key: string; // unique identifier for this variant combination
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "key">) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isEmpty: boolean;
}

/* --------------------------------------------- */
/* Helpers                                       */
/* --------------------------------------------- */

function generateCartKey(id: string, variants?: Record<string, string>) {
  if (!variants) return id;
  const sorted = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
  return `${id}__${sorted}`;
}

function sanitizeItem(raw: any): CartItem | null {
  if (!raw || typeof raw !== "object") return null;

  const id = typeof raw.id === "string" ? raw.id : null;
  if (!id) return null;

  const name = typeof raw.name === "string" ? raw.name : "Unknown Item";
  const price = typeof raw.price === "number" ? raw.price : 0;
  const quantity =
    typeof raw.quantity === "number" && raw.quantity > 0
      ? raw.quantity
      : 1;
  const image = typeof raw.image === "string" ? raw.image : undefined;

  const variants =
    raw.variants && typeof raw.variants === "object"
      ? Object.fromEntries(
          Object.entries(raw.variants).filter(
            ([, v]) => typeof v === "string"
          )
        )
      : undefined;

  const key =
    typeof raw.key === "string"
      ? raw.key
      : generateCartKey(id, variants);

  return { id, name, price, quantity, image, variants, key };
}

/* --------------------------------------------- */
/* Context                                       */
/* --------------------------------------------- */

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  /* --------------------------------------------- */
  /* Load cart from localStorage                   */
  /* --------------------------------------------- */

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      const sanitized = stored
        .map((i: any) => sanitizeItem(i))
        .filter(Boolean) as CartItem[];

      return sanitized;
    } catch {
      return [];
    }
  });

  /* --------------------------------------------- */
  /* Persist cart                                  */
  /* --------------------------------------------- */

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
    } catch {
      console.error("Failed to save cart to localStorage");
    }
  }, [items]);

  /* --------------------------------------------- */
  /* Cart Actions                                  */
  /* --------------------------------------------- */

  const addItem = (item: Omit<CartItem, "key">) => {
    const key = generateCartKey(item.id, item.variants);
    const qty = Math.max(1, item.quantity);

    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);

      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + qty } : i
        );
      }

      return [...prev, { ...item, key, quantity: qty }];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    const safeQty = Math.max(0, quantity);

    setItems((prev) =>
      prev
        .map((i) =>
          i.key === key ? { ...i, quantity: safeQty } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const increment = (key: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const decrement = (key: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.key === key ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const clearCart = () => setItems([]);

  /* --------------------------------------------- */
  /* Derived Values                                */
  /* --------------------------------------------- */

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const isEmpty = items.length === 0;

  /* --------------------------------------------- */
  /* Provider                                       */
  /* --------------------------------------------- */

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        increment,
        decrement,
        clearCart,
        total,
        itemCount,
        isEmpty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* --------------------------------------------- */
/* Hook                                           */
/* --------------------------------------------- */

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(
      "useCart must be used inside <CartProvider>. Ensure your layout wraps children with CartProvider."
    );
  }
  return context;
}