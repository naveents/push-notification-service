import * as https from 'https';
import { google } from 'googleapis';
import {IPushNotification} from "./sendPushService";

const PROJECT_ID = 'dineout';
const HOST = 'fcm.googleapis.com';
const PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];

export class FcmNotifyService {
    private key = require('../../config/dineoutServiceAccountKey.json');
    private accessToken: string | null = null;
    private tokenExpirationTime: number = 0;

    private async getAccessToken(): Promise<string> {

        if (this.accessToken && Date.now() < this.tokenExpirationTime) {
            return this.accessToken;
        }

        return new Promise<string>((resolve, reject) => {
            const jwtClient = new google.auth.JWT(
                this.key.client_email!,
                undefined,
                this.key.private_key!,
                SCOPES,
                undefined
            );

            jwtClient.authorize((err, tokens) => {
                if (err) {
                    reject(err);
                    return;
                }
                this.accessToken = tokens?.access_token!;
                this.tokenExpirationTime = (tokens?.expiry_date || 0) - 60000;
                resolve(this.accessToken);
            });
        });

    }

    private async sendFcmMessage(accessToken: string, fcmMessage: any): Promise<{ success: boolean, data: any, error: any }> {
        return new Promise<{ success: boolean, data: any, error: any }>((resolve, reject) => {


            const options: https.RequestOptions = {
                hostname: HOST,
                path: PATH,
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                }
            };

            const request = https.request(options, resp => {
                let data = '';

                resp.setEncoding('utf8');
                resp.on('data', chunk => {
                    data += chunk;
                });

                resp.on('end', () => {
                    let responseData;
                    try {
                        responseData = JSON.parse(data);
                    } catch (error) {
                        // Handle JSON parsing error
                        console.error('Error parsing JSON response:', error);
                        resolve({
                            success: false,
                            data: null,
                            error: 'Error parsing JSON response',
                        });
                        return;
                    }

                    // Check if the response contains an error
                    if (responseData && responseData.error) {
                        console.error('Error from FCM:', responseData.error);

                        // Check for specific FCM error codes
                        if (responseData.error.code === 400 && responseData.error.status === 'INVALID_ARGUMENT') {
                            resolve({
                                success: false,
                                data: null,
                                error: responseData.error
                                // error: 'Invalid FCM registration token: ' + responseData.error.status,
                            });
                            return;
                        }

                       resolve({
                            success: false,
                            data: null,
                            error: responseData.error,
                        });
                        return;
                    }

                    resolve({
                        success: true,
                        data: responseData,
                        error: null,
                    });
                });
            });


            request.on('error', err => {
                console.error('Error sending message to Firebase:', err);
                resolve({
                    success: false,
                    data: null,
                    error: err,
                });
            });



            request.write(JSON.stringify(fcmMessage));
            request.end();
        });
    }


    buildNotificationBody(token: string, title: string, body: string, data?: Record<string, any>): any {
      return {
            'message': {
                'token': token,
                'notification': {
                    'title': title,
                    'body': body
                },
                'data': data
            },

        };
    }

    async sendNotification(notification: IPushNotification): Promise<{ status: boolean, error: any, data: any }> {

        const accessToken = await this.getAccessToken();
        const fcmMessage = this.buildNotificationBody(
            notification.token,
            notification.title,
            notification.body,
            notification.data
        );

        try {
            const response = await this.sendFcmMessage(accessToken, fcmMessage);
            return {
                status: response.success,
                error: response.error,
                data: response.data
            };
        } catch (error) {
            // Handle errors from sendFcmMessage
            return {
                status: false,
                error: error,
                data: null
            };
        }
    }
}