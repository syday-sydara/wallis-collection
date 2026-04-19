"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

export type CartItem = {
  id: string;
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
  totalItems: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (item: Omit<CartItem, "id" | "quantity">) => void;
  updateQuantity: (id: string, qty: number) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_VERSION = "v1";

function hashAttributes(attrs?: Record<string, any>) {
  if (!attrs) return "";
  return Object.keys(attrs)
    .sort()
    .map((k) => `${k}:${attrs[k]}`)
    .join("|");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  /* ---------------- Load from localStorage ---------------- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cart");
      const version = localStorage.getItem("cart_version");

      if (stored && version === CART_VERSION) {
        setItems(JSON.parse(stored));
      } else {
        localStorage.removeItem("cart");
        localStorage.setItem("cart_version", CART_VERSION);
      }
    } catch {
      console.warn("Failed to load cart");
    }
  }, []);

  /* ---------------- Save to localStorage (debounced) ---------------- */
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem("cart", JSON.stringify(items));
        localStorage.setItem("cart_version", CART_VERSION);
      } catch {
        console.warn("Failed to save cart");
      }
    }, 150);

    return () => clearTimeout(id);
  }, [items]);

  /* ---------------- Drawer Controls ---------------- */
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  /* ---------------- Add Item ---------------- */
  const addItem = useCallback((item) => {
    setItems((prev) => {
      const key = hashAttributes(item.attributes);

      const existing = prev.find(
        (i) =>
          i.productId === item.productId &&
          hashAttributes(i.attributes) === key
      );

      if (existing) {
        return prev.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...prev, { id: crypto.randomUUID(), quantity: 1, ...item }];
    });

    setIsOpen(true);
    if (navigator.vibrate) navigator.vibrate(10);
  }, []);

  /* ---------------- Update Quantity ---------------- */
  const updateQuantity = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, qty) } : i
      )
    );
  }, []);

  const increaseQty = useCallback(
    (id: string) => updateQuantity(id, (items.find((i) => i.id === id)?.quantity ?? 1) + 1),
    [items, updateQuantity]
  );

  const decreaseQty = useCallback(
    (id: string) => updateQuantity(id, (items.find((i) => i.id === id)?.quantity ?? 1) - 1),
    [items, updateQuantity]
  );

  /* ---------------- Remove Item ---------------- */
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /* ---------------- Clear Cart ---------------- */
  const clear = useCallback(() => setItems([]), []);

  /* ---------------- Derived Values ---------------- */
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  /* ---------------- Provide Context ---------------- */
  const value = useMemo(
    () => ({
      items,
      isOpen,
      subtotal,
      totalItems,
      open,
      close,
      toggle,
      addItem,
      updateQuantity,
      increaseQty,
      decreaseQty,
      removeItem,
      clear,
    }),
    [
      items,
      isOpen,
      subtotal,
      totalItems,
      open,
      close,
      toggle,
      addItem,
      updateQuantity,
      increaseQty,
      decreaseQty,
      removeItem,
      clear,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
