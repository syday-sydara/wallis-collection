// services/whatsapp.service.ts
import { WhatsAppProvider } from "../providers/whatsapp.provider";
import { whatsappTemplates } from "../templates/whatsapp.templates";

export class WhatsAppService {
  static async sendTemplate({ to, template, variables }) {
    const tpl = whatsappTemplates[template];

    if (!tpl) throw new Error(`Unknown WhatsApp template: ${template}`);

    const resolvedVars = tpl.resolve(variables);

    return WhatsAppProvider.send({
      to,
      template: tpl.name,
      variables: resolvedVars,
    });
  }
}
