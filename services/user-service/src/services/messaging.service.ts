// src/services/messaging.service.ts
import axios from 'axios';
import * as querystring from 'querystring';

type MessageType = 'whatsapp' | 'sms';

export class MessagingService {
  private readonly baseUrl = 'https://api.goinfinito.com/unified/v2';
  private readonly smsStrikerUrl = 'https://www.smsstriker.com/API/sms.php';
  
  private readonly headers = {
    'x-client-id': process.env.INFINITO_CLIENT_ID || 'amigoinfwaz3zf16xa4hxs1c',
    'x-client-password': process.env.INFINITO_CLIENT_PASSWORD || 'z8ffuy1jjujh8pq8rhcoy7s2159o868o',
    'Content-Type': 'application/json'
  };

  private async sendWhatsApp(phoneNumber: string, message: string) {
    const fromNumber = process.env.INFINITO_FROM_NUMBER || '919000347979';
    
    const data = {
      apiver: "1.0",
      whatsapp: {
        ver: "2.0",
        dlr: { url: "" },
        messages: [
          {
            coding: 1,
            text: message,
            id: `Template-1571220-${Date.now()}`,
            msgtype: 1, // 1 for template message
            templateid: 1571220,
            addresses: [
              {
                to: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`,
                from: fromNumber
              }
            ]
          }
        ]
      }
    };

    try {
      const response = await axios.post(`${this.baseUrl}/send`, data, {
        headers: this.headers
      });
      console.log('WhatsApp API response:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      console.error('Error sending WhatsApp message:', errorMessage);
      throw error;
    }
  }

  private async sendSMS(phoneNumber: string, message: string) {
    const params = {
      username: process.env.SMS_USERNAME || 'AMIGO',
      password: process.env.SMS_PASSWORD || '142121',
      from: process.env.SMS_SENDER_ID || 'CEOSCB',
      to: phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`,
      msg: message,
      type: '1', // For Unicode support
      template_id: '1207172076273448301' 
    };

    try {
      const url = `${this.smsStrikerUrl}?${querystring.stringify(params)}`;
      const response = await axios.get(url);
      console.log('SMS API response:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      console.error('Error sending SMS:', errorMessage);
      throw error;
    }
  }

  public async sendOTP(phoneNumber: string, otp: string, type: MessageType) {
    let message: string;
    
    if (type === 'whatsapp') {
      message = `${otp} is the current reading of your meter FM1234`;
      return this.sendWhatsApp(phoneNumber, message);
    } else {
      message = `Your Login OTP is : ${otp}. CEOSCB`;
      return this.sendSMS(phoneNumber, message);
    }
  }
}

export const messagingService = new MessagingService();