// producers/whatsapp.outbound.producer.ts
import {
  whatsappOutboundQueue,
  WHATSAPP_OUTBOUND_QUEUE_NAME,
} from "../queues/whatsapp.outbound.queue";

export const WhatsAppOutboundProducer = {
  async send(template: string, to: string, variables: any) {
    const jobId = `${WHATSAPP_OUTBOUND_QUEUE_NAME}-${template}-${to}-${Date.now()}`;

    await whatsappOutboundQueue.add(
      template,
      {
        to,
        template,
        variables,
        timestamp: new Date(),
      },
      {
        jobId,
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    console.log("[WHATSAPP OUTBOUND PRODUCER] Enqueued:", {
      template,
      to,
    });
  },
};
