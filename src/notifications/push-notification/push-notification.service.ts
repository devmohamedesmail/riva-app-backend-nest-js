import { Injectable } from '@nestjs/common';

@Injectable()
export class PushNotificationService {


     async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data: any = {},
  ) {
    try {
      const validTokens = tokens.filter(
        (token) =>
          token &&
          token.startsWith('ExponentPushToken'),
      );

      if (!validTokens.length) {
        console.log('NO VALID TOKENS');
        return;
      }

      const messages = validTokens.map((token) => ({
        to: token,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'default',
      }));

      const response = await fetch(
        'https://exp.host/--/api/v2/push/send',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        },
      );

      const result = await response.json();

      console.log(
        'EXPO RESPONSE =>',
        JSON.stringify(result, null, 2),
      );

      return result;
    } catch (error) {
      console.error(
        'PUSH SEND ERROR =>',
        error,
      );
    }
  }
  
}
