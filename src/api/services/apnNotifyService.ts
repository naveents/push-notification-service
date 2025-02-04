import { ApnsClient, Notification } from 'apns2';
import fs from 'fs';
import path from 'path';
import { IPushNotification } from './sendPushService';

class ApnNotifyService {
    private static instance: ApnNotifyService;
    private readonly signingKeyPath: string;
    private client: ApnsClient;

    private constructor() {
        this.signingKeyPath = path.join(__dirname, '../../certificates/your-certificate.p8');
        this.client = this.createClient();
    }

    public static getInstance(): ApnNotifyService {
        if (!this.instance) {
            this.instance = new ApnNotifyService();
        }
        return this.instance;
    }

    private createClient() {
         return new ApnsClient({
            team: 'YOUR TEAM ID',
            keyId: 'YOUR KEY',
            signingKey: fs.readFileSync(this.signingKeyPath),
            requestTimeout: 0,
            keepAlive: true
        });
    }

    async sendNotification(notification: IPushNotification, appTypeName: string) {

        const defaultTopic = 'com.dineout-app';

        const notificationBody = new Notification(notification.token, {
            alert: {
                title: notification.title,
                body: notification.body,
            },
            badge: 4,
            data: notification.data || {},
            topic: defaultTopic
        });

        try {
            const result = await this.client.send(notificationBody);
            return { status: true, data: result, error: null };
        } catch (error: any) {
            console.error('APNs send error:', error);

            if (error && error.reason === 'DeviceTokenNotForTopic') {
                console.error(`DeviceTokenNotForTopic: ${error.reason}`);
            } else if (error && error.reason === 'BadDeviceToken') {
                console.error(`BadDeviceToken: ${error.reason}`);
            } else {
                console.error(`Unknown error: ${error.reason}`);
            }
            return {
                status: false,
                data: null,
                error: { reason: error.reason ?? error.toString(), statusCode: error.statusCode ?? '' },
            };
        }
    }
}

export default ApnNotifyService;
