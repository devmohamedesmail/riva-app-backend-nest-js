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
          token.startsWith(
            'ExponentPushToken',
          ),
      );

      console.log(validTokens);

      // هنا ابعت Expo Notification
    } catch (error) {
      console.log(error);
    }
  }
}
