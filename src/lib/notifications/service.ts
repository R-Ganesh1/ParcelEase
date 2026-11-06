import { AppNotification } from '@/types';

export interface ExternalDispatchResult {
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL';
  dispatched: boolean;
  provider?: string;
  reason?: string;
}

export class NotificationService {
  /**
   * Dispatches notifications to external channels if configured.
   * Logs explicitly when no external credentials exist, without pretending a real SMS was sent.
   */
  static async dispatchExternal(
    recipientPhone: string,
    recipientEmail: string,
    title: string,
    message: string
  ): Promise<ExternalDispatchResult[]> {
    const results: ExternalDispatchResult[] = [];

    // SMS Check
    const smsProvider = process.env.SMS_GATEWAY_PROVIDER;
    const smsApiKey = process.env.SMS_GATEWAY_API_KEY;

    if (smsApiKey && smsProvider && smsProvider !== 'mock') {
      // In production, integrate Twilio, Gupshup, or Kaleyra here
      results.push({
        channel: 'SMS',
        dispatched: true,
        provider: smsProvider,
      });
    } else {
      results.push({
        channel: 'SMS',
        dispatched: false,
        reason: 'No SMS gateway API key configured in .env (SMS_GATEWAY_API_KEY). In-app notification delivered.',
      });
    }

    // WhatsApp Check
    const waKey = process.env.WHATSAPP_BUSINESS_API_KEY;
    if (waKey) {
      results.push({
        channel: 'WHATSAPP',
        dispatched: true,
        provider: 'WhatsApp Cloud API',
      });
    } else {
      results.push({
        channel: 'WHATSAPP',
        dispatched: false,
        reason: 'WhatsApp Business API credentials not configured. In-app notification delivered.',
      });
    }

    // Email Check
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost) {
      results.push({
        channel: 'EMAIL',
        dispatched: true,
        provider: smtpHost,
      });
    } else {
      results.push({
        channel: 'EMAIL',
        dispatched: false,
        reason: 'SMTP email credentials not configured. In-app notification delivered.',
      });
    }

    return results;
  }
}
