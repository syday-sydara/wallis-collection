// lib/core/events-context.ts
import { events } from "./events";
import { serviceContext } from "./service-context";

export const emitEvent = async (event: string, payload: any = {}) => {
  const ctx = serviceContext.get();
  await events.emit(event, { ...payload, ...ctx });
};
