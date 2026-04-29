// lib/whatsapp/state.ts

import { prisma } from "@/lib/prisma";
import { WhatsAppState } from "./state-types";

export async function getUserState(whatsapp: string): Promise<WhatsAppState> {
  const session = await prisma.whatsAppSession.findUnique({
    where: { whatsapp },
  });

  return (session?.state as WhatsAppState) ?? "IDLE";
}

export async function setUserState(
  whatsapp: string,
  state: WhatsAppState,
  data?: any
) {
  await prisma.whatsAppSession.upsert({
    where: { whatsapp },
    create: { whatsapp, state, data },
    update: { state, data },
  });
}
