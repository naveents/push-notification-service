import ApnNotifyService from "./apnNotifyService";
import {FcmNotifyService} from "./fcmNotifyService";
import {PushLoggerService} from "./pushLoggerService";
import {HcmNotifyService} from "./hcmNotifyService";

interface PushPayload {
    notification: {
        title: string;
        body: string;
        messageType: string;
        attributes: {} | any[];
        recipients: {
            userUuid: string;
            userName: string;
            deviceToken: string;
            deviceType: string;
            pushApi: string;
            appTypeName: string;
        }[];
    };
}

export interface IPushNotification {
    token: string;
    title: string;
    body: string;
    data?: Record<string, any>;
}


export class SendPushService {

    private static fcmService: FcmNotifyService = new FcmNotifyService();
    private static apnService: ApnNotifyService = ApnNotifyService.getInstance();
    private readonly pushPayload: PushPayload;
    private readonly logger: PushLoggerService;

    constructor(payload: PushPayload) {
        this.pushPayload = payload;
        this.logger = new PushLoggerService();
    }

    async processPush() {
        console.log('Processing push request: ', this.pushPayload);

        if (this.pushPayload.notification) {

            const {title, body, recipients, attributes = [], messageType} = this.pushPayload.notification;

            if (recipients.length > 0) {

                for (const recipient of recipients) {
                    const {deviceToken, deviceType, userUuid, appTypeName, pushApi, userName} = recipient;

                    let pushApiError = "";
                    let pushSendStatus = false;
                    try {
                        const notification: IPushNotification = {
                            token: deviceToken,
                            title: title,
                            body: body,
                            data: attributes
                        };

                        let result;

                        if (pushApi === 'apn' && deviceType === 'ios') {
                            console.log('APN initialized');
                            result = await SendPushService.apnService.sendNotification(notification, appTypeName);
                        } else if (pushApi === 'fcm' && deviceType === 'android') {
                            console.log('FCM initialized ');
                            result = await SendPushService.fcmService.sendNotification(notification);
                        } else if (pushApi === 'hcm' && deviceType === 'android') {
                            const hcmNotifyService = new HcmNotifyService(appTypeName);
                            result = await hcmNotifyService.sendNotification(notification);
                        } else {
                            console.log(`INVALID PUSH API / DEVICE : ${pushApi}/${deviceType}`);
                            throw new Error(`Invalid push API or device type: ${pushApi}/${deviceType}`);
                        }

                        console.log(`Response from pushApi ${pushApi} is `, result);
                        pushSendStatus = result.status ?? false;
                        if (!pushSendStatus) {
                            //pushApiError = (result.error) ? result.error : result.data;
                            pushApiError = result.error ? JSON.stringify(result.error) : JSON.stringify(result.data);
                        }

                    } catch (error: any) {
                        console.log(error);
                        pushApiError = `Error processing push request for user ${userUuid} - Error is  ${error}`;
                        pushSendStatus = false;
                    }

                    await this.logger.logPushDetails({
                        title,
                        body,
                        messageType,
                        deviceToken,
                        deviceType,
                        userUuid,
                        pushApi,
                        attributes,
                        pushStatus: pushSendStatus,
                        error: pushApiError,
                    });

                } //foreach recipients
            }

        }
    }
}