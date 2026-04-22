"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useMemo,
} from "react";

//
// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
//

export type SecurityEvent = {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  category?: string | null;
  actorId?: string | null;
  ip?: string | null;
  tags?: string[];
  requestId?: string | null;
};

export type SecurityFilters = {
  severity: string[];
  category: string[];
  search: string;
  timeRange: "15m" | "1h" | "24h" | "7d" | "all";
};

type State = {
  events: SecurityEvent[];
  filters: SecurityFilters;
  connected: boolean;
};

type Action =
  | { type: "ADD_EVENT"; event: SecurityEvent }
  | { type: "SET_CONNECTED"; value: boolean }
  | { type: "SET_FILTERS"; filters: Partial<SecurityFilters> };

//
// ─────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────
//

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_EVENT": {
      // Deduplicate by ID
      if (state.events.some((e) => e.id === action.event.id)) return state;

      return {
        ...state,
        events: [action.event, ...state.events].slice(0, 500), // keep last 500
      };
    }

    case "SET_CONNECTED":
      return { ...state, connected: action.value };

    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.filters },
      };

    default:
      return state;
  }
}

//
// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
//

const SecurityContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

//
// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────
//

export function SecurityContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, {
    events: [],
    connected: false,
    filters: {
      severity: [],
      category: [],
      search: "",
      timeRange: "1h",
    },
  });

  //
  // SSE subscription
  //
  useEffect(() => {
    const url = "/api/security/events/stream";
    const es = new EventSource(url);

    es.onopen = () => dispatch({ type: "SET_CONNECTED", value: true });

    es.onerror = () => dispatch({ type: "SET_CONNECTED", value: false });

    es.onmessage = (msg) => {
      try {
        const event: SecurityEvent = JSON.parse(msg.data);
        dispatch({ type: "ADD_EVENT", event });
      } catch (err) {
        console.error("Failed to parse SSE event", err);
      }
    };

    return () => es.close();
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

//
// ─────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────
//

export function useSecurityContext() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error("useSecurityContext must be inside provider");
  return ctx;
}

export function useSecurityEvents() {
  const { state } = useSecurityContext();
  return state.events;
}

export function useSecurityFilters() {
  const { state, dispatch } = useSecurityContext();

  return {
    filters: state.filters,
    setFilters: (f: Partial<SecurityFilters>) =>
      dispatch({ type: "SET_FILTERS", filters: f }),
  };
}

export function useSecurityConnectionStatus() {
  const { state } = useSecurityContext();
  return state.connected;
}
