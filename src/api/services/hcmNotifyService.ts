import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {IPushNotification} from "./sendPushService";

const HCM_APP_ID_DINEOUT = '10200000';
const HCM_CLIENT_ID_DINEOUT = '5000000';
const HCM_CLIENT_SECRET_DINEOUT = 'eredsfsd379b609852d2ec7afac1805231762403f5b3basdfsdfsdfsdfsd8';

//https://developer.huawei.com/consumer/en/doc/HMSCore-Guides/android-server-dev-0000001050040110
export class HcmNotifyService {
    private readonly clientIdDINEOUT: string;
    private readonly clientSecretDINEOUT: string;
    private readonly accessTokenUrl: string;
    private readonly pushUrl: string;

    constructor(appTypeName: string) {
        this.clientIdDINEOUT = HCM_CLIENT_ID_DINEOUT;
        this.clientSecretDINEOUT = HCM_CLIENT_SECRET_DINEOUT;
        this.accessTokenUrl = 'https://oauth-login.cloud.huawei.com/oauth2/v3/token';
        this.pushUrl = 'https://push-api.cloud.huawei.com/v1/{APP_ID}/messages:send';
    }

    private async getAccessToken(): Promise<string | null> {
        try {
            const config: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            } as AxiosRequestConfig;

            const data = `grant_type=client_credentials&client_id=${this.clientIdDINEOUT}&client_secret=${this.clientSecretDINEOUT}`;


            const response: AxiosResponse = await axios.post(this.accessTokenUrl, data, config);

            if (response.data && response.data.access_token) {
                return response.data.access_token;
            }

            return null;
        } catch (error: any) {
            console.error('Error getting access token:', error.message);
            return null;
        }
    }

    public async sendNotification(notification: IPushNotification): Promise<{ status: boolean, error: any, data: any }> {
        try {
            const accessToken = await this.getAccessToken();

            if (!accessToken) {
               // console.error('Failed to obtain access token.');
                return {
                    status: false,
                    error: 'Failed to obtain access token.',
                    data: null
                }
            }

            const appId =  HCM_APP_ID_DINEOUT;
            const url = this.pushUrl.replace('{APP_ID}', appId);


            const pushData = {
                validate_only: false, //todo: change to false in production
                message: {
                    notification: {
                        title: notification.title,
                        body: notification.body
                    },
                    android: {
                        notification: {
                            importance: "NORMAL",
                            click_action: {
                                type: 3 //tap to start the app
                            },
                        },
                    },
                    token: [notification.token],
                },
            };


            console.log("HCM push data is as follows ", pushData);

            const config: AxiosRequestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            } as AxiosRequestConfig;

            const response: AxiosResponse = await axios.post(url, pushData, config);

            if (response.status === 200) {
                console.log('Received HCM response data:', response.data);

                if(response.data.code !== '80000000' )    {
                    return {
                        status: false,
                        error: response.data.msg,
                        data: response.data
                    }
                } else {
                    return {
                        status: true,
                        error: null,
                        data: response.data
                    }
                }
            } else {
               // console.error('Failed to send notification:', response.status, response.data);
                return {
                    status: false,
                    error: 'HCM notification failed: '+ response.data,
                    data: response.status
                }
            }
        } catch (err: any) {
            //console.error('Error sending notification:', err.message);
            return {
                status: false,
                error: 'Error sending HCM notification:'+ err.message,
                data: null
            }
        }
    }
}
